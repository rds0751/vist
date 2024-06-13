import { toChecksumAddress } from 'ethereumjs-util';
import { Mutex } from 'async-mutex';
import BigNumber from 'bignumber.js';
import BaseController, { BaseConfig, BaseState } from '../BaseController';
import {
  getAvailableUrl,
  handleFetch,
  logDebug,
  logInfo,
  logWarn,
  safelyExecute,
  safelyExecuteWithTimeout,
} from '../util';
import { BaseChainConfig, ChainType, NetworkConfig } from '../Config';
import AssetsController, { TokenNoChange } from './AssetsController';
import TokenBalancesController from './TokenBalancesController';

interface OHLCItem {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface OHLCInfo {
  id: string;
  during: string;
  time: number;
  info: OHLCItem[];
}

/**
 * @type CoinGeckoResponse
 *
 * CoinGecko API response representation
 *
 */
export interface CoinGeckoResponse {
  [address: string]: TokenPrice;
}

/**
 * @type TokenInfoResponse
 * Uniswap, PancakeSwap, QuickSwap graph response
 */
export interface TokenInfoResponse {
  data: TokenInfoData;
}

interface TokenInfoData {
  tokens: TokenInfo[];
}

interface TokenInfo {
  id: string;
  symbol: string;
  derivedETH: string; // uniswap & quickswap have derivedETH
  derivedUSD: string; // only pancakeswap has derivedUSD
}

interface BlockInfoResponse {
  data: BlockInfoData;
}

interface BlockInfoData {
  blocks: BlockInfo[];
}

interface BlockInfo {
  number: string;
}

export enum LockType {
  LockArb = 0x01,
  LockPolygon = 0x02,
}

/**
 * @type Token
 *
 * Token representation
 *
 * @property address - Hex address of the token contract
 * @property decimals - Number of decimals the token uses
 * @property symbol - Symbol of the token
 * @property image - Image of the token, url or bit32 image
 */
export interface Token {
  address: string;
  decimals: number;
  symbol: string;
  l1Address?: string; // 只有arbitrum上的资产有此项
}

export interface TokenPrice {
  usd: number;
  usd_24h_change: number;
  timestamp: number;
}

/**
 * @type TokenRatesConfig
 *
 * Token rates controller configuration
 *
 * @property interval - Polling interval used to fetch new token rates
 * @property tokens - List of tokens to track exchange rates for
 */
export interface TokenRatesConfig extends BaseConfig {
  interval: number;
  basic_price_timestamp: number;
}

export interface CoinInfo {
  liquidity?: string;
  marketCap: string;
  circulation: string;
  totalSupply: string;
  ath: string;
  mcRank: string;
  totalVolume: string;
  fdv: string;
  intro: string;
  time: number;
}

/**
 * @type TokenRatesState
 *
 * Token rates controller state
 *
 * @property contractExchangeRates - Hash of token contract addresses to exchange rates
 */
export interface TokenRatesState extends BaseState {
  allContractExchangeRates: { [chainType: number]: { [address: string]: TokenPrice } };
  allCurrencyPrice: { [chainType: number]: TokenPrice };
  bitcoinPrice: TokenPrice;
  usdRates: { [code: string]: number };
  currencyCodeRate: number;
  currencyCode: string;
  ohlcInfos: { [id: string]: OHLCInfo };
  obtainRateTimestamp: number;
  coinInfos: { [id: string]: CoinInfo };
  tvSymbol: { [symbol: string]: string };
}

/**
 * Controller that passively polls on a set interval for token-to-fiat exchange rates
 * for tokens stored in the AssetsController
 */
export class TokenRatesController extends BaseController<TokenRatesConfig, TokenRatesState> {
  private handle?: NodeJS.Timer;

  private update_Rates_handle?: NodeJS.Timer;

  private mutex = new Mutex();

  private mutexRate = new Mutex();

  private polling_counter = 0;

  private update_Rates_counter = 0;

  private supportExtendRates = [ChainType.Ethereum, ChainType.Bsc, ChainType.Polygon];

  private getPricingURL(query: string, path: string) {
    return `https://api.coingecko.com/api/v3/simple/token_price/${path}?${query}`;
  }
  //bitcoin
  private getBasicPricingURL(ids: string[]) {
    let strIds;
    for (const id of ids) {
      if (!strIds) {
        strIds = id;
      } else {
        strIds = `${strIds}%2C${id}`;
      }
    }
    return `https://api.coingecko.com/api/v3/simple/price?ids=${strIds}&vs_currencies=usd&include_24hr_change=true`;
  }

  private getUsdRateURL() {
    return `https://open.er-api.com/v6/latest/USD`;
  }

  /**
   * Name of this controller used during composition
   */
  name = 'TokenRatesController';

  /**
   * List of required sibling controllers this controller needs to function
   */
  requiredControllers = ['AssetsController'];

  /**
   * Creates a TokenRatesController instance
   *
   * @param config - Initial options used to configure this controller
   * @param state - Initial state to set on this controller
   */
  constructor(config?: Partial<TokenRatesConfig>, state?: Partial<TokenRatesState>) {
    super(config, state);
    this.defaultConfig = {
      disabled: true,
      interval: 180000,
      basic_price_timestamp: 0,
    };
    const allCurrencyPrice: { [type: number]: TokenPrice } = {};
    const allContractExchangeRates: { [chainType: number]: { [address: string]: TokenPrice } } = {};
    for (const type in NetworkConfig) {
      const chainType = Number(type);
      allCurrencyPrice[chainType] = {
        usd: 0,
        usd_24h_change: 0,
        timestamp: 0,
      };
      allContractExchangeRates[chainType] = {};
    }
    this.defaultState = {
      allContractExchangeRates,
      allCurrencyPrice,
      bitcoinPrice: {
        usd: 0,
        usd_24h_change: 0,
        timestamp: 0,
      },
      usdRates: { USD: 1 },
      currencyCodeRate: 1,
      currencyCode: 'USD',
      ohlcInfos: {},
      obtainRateTimestamp: 0,
      coinInfos: {},
      tvSymbol: {},
    };
    this.initialize();
    this.configure({ disabled: false }, false, false);
  }

  /**
   * Sets a new polling interval
   *
   * @param interval - Polling interval used to fetch new token rates
   */
  async poll(interval?: number): Promise<void> {
    if (this.polling_counter > 1) {
      return;
    }
    this.polling_counter += 1;
    interval && this.configure({ interval }, false, false);
    this.handle && clearTimeout(this.handle);
    await this.refresh();
    this.polling_counter -= 1;
    if (this.polling_counter > 0) {
      return;
    }
    this.handle = setTimeout(() => {
      this.poll(this.config.interval);
    }, this.config.interval);
  }

  async refresh() {
    const tokenBalancesController = this.context.TokenBalancesController as TokenBalancesController;
    if (tokenBalancesController.config.backgroundMode) {
      return;
    }
    const releaseLock = await this.mutex.acquire();
    const start = Date.now();
    const intervals: number[] = [];
    await safelyExecute(() => this.updateBasicExchangeRates());
    intervals.push(Date.now() - start);

    let strLog = '';
    for (const type in NetworkConfig) {
      const chainType = Number(type);

      if (NetworkConfig[chainType].Disabled) {
        continue;
      }

      const { addresses, success } = await safelyExecute(() => this.updateExchangeRates(chainType));
      intervals.push(Date.now() - start);
      if (this.supportExtendRates.includes(chainType)) {
        addresses?.length && (await safelyExecute(() => this.extendExchangeRates(addresses, chainType)));
      } else {
        addresses?.length && this.fixExtendExchangeRates(addresses, chainType);
      }
      intervals.push(Date.now() - start);

      strLog += `,${type} ${success}`;
    }

    logDebug(`leon.w@${this.name} refresh: intervals=${intervals} ${strLog}`);
    releaseLock();
  }

  /**
   * Fetches a pairs of token address and native currency
   *
   * @param query - Query according to tokens in tokenList and native currency
   * @returns - Promise resolving to exchange rates for given pairs
   */
  async fetchExchangeRate(query: string, path: string): Promise<CoinGeckoResponse> {
    const { url, options } = await getAvailableUrl(this.getPricingURL(query, path));
    return await handleFetch(url, options);
  }

  /**
   * @param query
   * @param ids
   * @param derived
   * @param block
   * @returns
   */
  async fetchContractTokensRate(
    query: string,
    ids: string[],
    derived: string,
    block: number,
  ): Promise<TokenInfoResponse> {
    const graphQL = {
      operationName: 'tokens',
      variables: { ids },
      query:
        block > 0
          ? `fragment TokenFields on Token {id, name, symbol, ${derived}}
          query tokens($ids:[String!]){tokens( block:{number : ${block}} where: {id_in: $ids}) { ...TokenFields }}`
          : `fragment TokenFields on Token {id, name, symbol, ${derived}}
          query tokens($ids:[String!]){tokens( where: {id_in: $ids}) { ...TokenFields }}`,
    };
    const options = {
      method: 'POST',
      body: JSON.stringify(graphQL),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    return handleFetch(query, options);
  }

  /**
   * fetch token price on Uniswap
   * @param ids
   * @returns
   */
  async fetchERC20Rate(ids: string[], block: number): Promise<TokenInfoResponse> {
    const url = 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2';
    return this.fetchContractTokensRate(url, ids, 'derivedETH', block);
  }

  /**
   * fetch token price on pancakeswap
   * @param ids
   * @returns
   */
  async fetchBEP20Rate(ids: string[], block: number): Promise<TokenInfoResponse> {
    const url = 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2';
    return this.fetchContractTokensRate(url, ids, 'derivedUSD', block);
  }

  /**
   * PRC 是用做区分Polygon代币，并不是真实的协议名，Polygon上也叫ERC20
   * @param ids
   * @returns
   */
  async fetchPRC20Rate(ids: string[], block: number): Promise<TokenInfoResponse> {
    const url = 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06';
    return this.fetchContractTokensRate(url, ids, 'derivedETH', block);
  }

  tokenInfo2Price(infos: TokenInfoResponse): CoinGeckoResponse {
    /**
     * usd: 0, usd_24h_change: 0
     */
    const { usd } = this.state.allCurrencyPrice[ChainType.Ethereum];
    if (usd === 0) {
      return {};
    }
    const tokenInfos = infos?.data?.tokens || [];
    const response: CoinGeckoResponse = {};
    for (const info of tokenInfos) {
      const priceInfo = { usd: 0, usd_24h_change: 0, timestamp: Date.now() };
      if (info.derivedETH) {
        priceInfo.usd = parseFloat(info.derivedETH) * usd;
      } else if (info.derivedUSD) {
        priceInfo.usd = parseFloat(info.derivedUSD);
      }
      response[info.id] = priceInfo;
    }
    return response;
  }

  calculate24hRate(prices: CoinGeckoResponse, grapRep24h: TokenInfoResponse) {
    const tokenInfos = grapRep24h?.data?.tokens || [];
    const { usd, usd_24h_change } = this.state.allCurrencyPrice[ChainType.Ethereum];
    for (const info of tokenInfos) {
      if (prices[info.id]) {
        let rate_24h = 0;
        if (info.derivedETH) {
          const eth_usd_24h = usd / (1 + usd_24h_change / 100);
          const derived_eth_24h = parseFloat(info.derivedETH);
          const derived_usd_24h = derived_eth_24h * eth_usd_24h;
          rate_24h = derived_eth_24h !== 0 ? (prices[info.id].usd - derived_usd_24h) / derived_usd_24h : 0;
        } else if (info.derivedUSD) {
          const price_24h = parseFloat(info.derivedUSD);
          rate_24h = price_24h !== 0 ? (prices[info.id].usd - price_24h) / price_24h : 0;
        }
        rate_24h *= 100;
        prices[info.id].usd_24h_change = rate_24h;
      }
    }
  }

  /**
   * 根据时间戳查区块高度
   * @param query
   * @param timestamp
   * @returns
   */
  async timestamp2Block(query: string, timestamp: number): Promise<BlockInfoResponse> {
    const graphQL = {
      operationName: 'blocks',
      variables: { timestamp },
      query: `query blocks ($timestamp : Int!) {blocks(first: 1  orderBy: timestamp  orderDirection: desc  where: {timestamp_lt: $timestamp}) {number  __typename}}`,
    };
    const options = {
      method: 'POST',
      body: JSON.stringify(graphQL),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    return handleFetch(query, options);
  }

  async fetchEthBlocks(timestamp: number): Promise<BlockInfoResponse> {
    const url = 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks';
    return this.timestamp2Block(url, timestamp);
  }

  async fetchBscBlocks(timestamp: number): Promise<BlockInfoResponse> {
    const url = 'https://api.thegraph.com/subgraphs/name/pancakeswap/blocks';
    return this.timestamp2Block(url, timestamp);
  }

  async fetchPolygonBlocks(timestamp: number): Promise<BlockInfoResponse> {
    const url = 'https://api.thegraph.com/subgraphs/name/sameepsi/maticblocks';
    return this.timestamp2Block(url, timestamp);
  }

  private normalizeOHLCInfo(info: any): OHLCItem {
    return {
      time: info[0],
      open: info[1],
      high: info[2],
      low: info[3],
      close: info[4],
    };
  }

  // https://api.coingecko.com/api/v3/coins/{id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false
  getCoinInfo(id: string): { load: any; coinInfo: CoinInfo } {
    const coin = this.state.coinInfos[id];
    if (coin?.time && Date.now() - coin.time < 10 * 60 * 1000) {
      return { coinInfo: coin, load: null };
    }
    return { coinInfo: coin, load: true };
  }

  async loadCoinInfo(id: string, address: string, type: ChainType) {
    return new Promise<CoinInfo>(async (resolve) => {
      const coinUrl = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`;
      const { url, options } = await getAvailableUrl(coinUrl);
      const result = await handleFetch(url, options);
      const coinInfo: CoinInfo = {
        marketCap: result?.market_data?.market_cap?.usd,
        circulation: result?.market_data?.circulating_supply,
        totalSupply: result?.market_data?.total_supply,
        ath: result?.market_data?.ath?.usd,
        mcRank: result?.market_data?.market_cap_rank,
        totalVolume: result?.market_data?.total_volume?.usd,
        fdv: result?.market_data?.fully_diluted_valuation?.usd,
        intro: result?.description?.en,
        time: Date.now(),
      };
      if (address) {
        try {
          const other = await this.fetchOtherCoinInfo(address.toLowerCase(), type);
          if (other) {
            coinInfo.liquidity = other.data?.tokens?.[0]?.totalLiquidity;
          }
        } catch (e) {
          console.log('PPYang getCoinInfo fetchOtherCoinInfo e:', e);
        }
        try {
          const sushiResult = await this.fetchSushiLiquidity(address.toLowerCase(), type);
          if (sushiResult) {
            const strLiquidity = sushiResult.data?.tokens?.[0]?.liquidity;
            if (strLiquidity) {
              if (coinInfo.liquidity) {
                coinInfo.liquidity = new BigNumber(strLiquidity).plus(coinInfo.liquidity).toString(10);
              } else {
                coinInfo.liquidity = strLiquidity;
              }
            }
          }
        } catch (e) {
          console.log('PPYang getCoinInfo fetchSushiLiquidity e:', e);
        }
      }
      this.state.coinInfos[id] = coinInfo;
      this.update({ coinInfos: { ...this.state.coinInfos } });
      resolve(coinInfo);
    });
  }

  async fetchOtherCoinInfo(id: string, type: ChainType) {
    const graphUrl = NetworkConfig[type]?.OtherCoinInfoUrl;
    if (!graphUrl) {
      return null;
    }
    const ids = [id];
    const graphQL = {
      operationName: 'tokens',
      variables: { ids },
      query: `fragment TokenFields on Token {id, totalLiquidity}
          query tokens($ids:[String!]){tokens( where: {id_in: $ids}) { ...TokenFields }}`,
    };
    const options = {
      method: 'POST',
      body: JSON.stringify(graphQL),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    return handleFetch(graphUrl, options);
  }

  async fetchSushiLiquidity(id: string, type: ChainType) {
    const graphUrl = NetworkConfig[type]?.SushiswapGraphUrl;
    if (!graphUrl) {
      return null;
    }
    const ids = [id];
    const graphQL = {
      operationName: 'tokens',
      variables: { ids },
      query: `query token($ids:[String!]){tokens( where: {id_in: $ids}) { liquidity }}`,
    };
    const options = {
      method: 'POST',
      body: JSON.stringify(graphQL),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    return handleFetch(graphUrl, options);
  }

  // https://www.coingecko.com/api/documentations/v3#/coins/get_coins__id__ohlc
  getOHLC(id: string, during: string, force = false): { load: any; info: OHLCItem[] } {
    const ohlc = this.state.ohlcInfos[id];
    if (
      !force &&
      ohlc &&
      ohlc.during === during &&
      ohlc.time &&
      Date.now() - ohlc.time < 10 * 60 * 1000 &&
      ohlc.info?.length > 0
    ) {
      return { info: ohlc.info, load: null };
    }
    return { info: ohlc?.info, load: true };
  }

  async loadOHLC(id: string, during: string) {
    return new Promise<OHLCItem[]>(async (resolve) => {
      const url = `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${during}`;

      const result = await this.handleOHLCFetch(url);
      let normalizedOHLCInfos: OHLCItem[] = [];
      if (result && Array.isArray(result) && result.length > 0) {
        normalizedOHLCInfos = result?.map((info: any) => this.normalizeOHLCInfo(info));
      }
      if (normalizedOHLCInfos && normalizedOHLCInfos.length > 0) {
        const new_ohlcInfos = this.state.ohlcInfos ? { ...this.state.ohlcInfos } : {};
        new_ohlcInfos[id] = {
          id,
          time: Date.now(),
          during,
          info: normalizedOHLCInfos,
        };
        this.update({ ohlcInfos: new_ohlcInfos });
      }
      resolve(normalizedOHLCInfos);
    });
  }

  getTvSymbol(searchName: string): { load: any; ticker: string } {
    /**
     *  Query TradingView Symbol api. Try it at the symbol input field at https://www.tradingview.com/widget/advanced-chart/
     *
     *  Abnormal cases: if search 'USDT' directly, the 1st
     *  element you get is 'ADAUSDT', so it needs to be converted to 'USDTUSD'
     *
     *  Normal case: do nothing because there are some
     *  symbols like SPELL doesn't have SPELLUSD but SPELLWETH, just use the default result to fit more cases.
     */
    const abnormals = ['ETH', 'USDT', 'USDC', 'DAI', 'TUSD', 'BUSD', 'WETH', 'HT', 'BNB'];

    searchName = searchName.replace('.e', ''); // for xxx.e tokens in avalanche
    if (searchName === 'WETH') {
      searchName += 'USDT';
    } else {
      for (const a in abnormals) {
        if (searchName === abnormals[a]) {
          searchName += 'USD';
          break;
        }
      }
    }

    const ticker = this.state.tvSymbol[searchName];
    if (ticker) {
      return { ticker, load: null };
    }
    return { ticker, load: true };
  }

  async loadTvSymbol(searchName: string) {
    return new Promise<string>(async (resolve) => {
      this.state.tvSymbol[searchName] = searchName;
      resolve(searchName);
      // try {
      //   const url = `https://symbol-search.tradingview.com/symbol_search/?text=${searchName}&hl=1&type=bitcoin,crypto&domain=production`;
      //   const result = await handleFetch(url, { method: 'GET' });
      //   const symbol = result?.[0]?.symbol || searchName;
      //   this.state.tvSymbol[searchName] = symbol;
      //   resolve(symbol);
      // } catch (e) {
      //   console.log('caiu aqui??');

      // }
    });
  }

  async handleOHLCFetch(url: string) {
    const { url: availableUrl, options } = await getAvailableUrl(url);
    return await handleFetch(availableUrl, options);
  }

  /**
   * Extension point called if and when this controller is composed
   * with other controllers using a ComposableController
   */
  onComposed() {
    super.onComposed();
    setTimeout(() => this.poll(), 10000);
    setTimeout(() => this.pollUsdRates(), 10000);
    const assets = this.context.AssetsController as AssetsController;
    assets.subscribe(
      ({ tokenChangedType }) => {
        if (tokenChangedType !== TokenNoChange) {
          setTimeout(() => this.poll(), 100);
        }
      },
      ['allTokens', 'tokenChangedType'],
    );
  }

  async fetchTokenPrices() {
    const graphUrl = 'https://rollux.graph.pegasys.fi/subgraphs/name/pollum-io/pegasys-v3';
    const graphQL = {
      operationName: 'tokens',
      query: `{
        tokens {
          name
          derivedSYS
          symbol
          id
        }
        bundles {
          sysPriceUSD
        }
      }`,
    };
    const options = {
      method: 'POST',
      body: JSON.stringify(graphQL),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(graphUrl, options);
    if (!response.ok) {
      throw new Error(`Fetch failed with status '${response.status}' for request '${graphUrl}'`);
    }

    try {
      const { data } = await response.json();
      const organizedData = {
        tokens: data.tokens.map((token: any) => ({
          id: token.id,
          name: token.name,
          derivedSYS: token.derivedSYS,
          symbol: token.symbol,
        })),
        sysPriceUSD: data.bundles[0]?.sysPriceUSD,
      };

      return organizedData;
    } catch (e) {
      logDebug(`leon.w@handleFetch@${graphUrl} failed response=`, response);
      throw e;
    }
  }

  /**
   * Updates exchange rates for all tokens
   *
   * @returns Promise resolving when this operation completes
   */

  async updateExchangeRates(chainType = ChainType.Ethereum): Promise<{ addresses: string[]; success: boolean }> {
    // We need to fix this because the exchange rate is not correct for Rollux
    if (chainType === ChainType.Rollux) {
      const newContractExchangeRates: { [address: string]: TokenPrice } = {};
      const additionalPrices = await this.fetchTokenPrices();

      additionalPrices.tokens.forEach((token: any) => {
        if (token.id) {
          const address = token.id;
          newContractExchangeRates[address] = {
            usd: token.derivedSYS * additionalPrices.sysPriceUSD,
            usd_24h_change: 0,
            timestamp: Date.now(),
          };
        }
      });

      const allContractExchangeRates = { ...this.state.allContractExchangeRates };
      allContractExchangeRates[chainType] = { ...newContractExchangeRates };

      this.update({ allContractExchangeRates });
      return { addresses: [], success: true };
    }

    const assetsController = this.context.AssetsController as AssetsController;
    const baseConfig: { [index: string]: any } = BaseChainConfig;
    const mainChainId = this.networks[chainType].getMainChainId();
    const currentRates = this.state.allContractExchangeRates[chainType] || {};
    const coingecko_path = baseConfig[mainChainId]?.coingecko_path;
    if (!coingecko_path) {
      return { addresses: [], success: true };
    }

    const { allTokens } = assetsController.state;
    const addresses: string[] = [];

    const now = Date.now();
    for (const addressKey in allTokens) {
      const tokens = allTokens[addressKey]?.[mainChainId] || [];
      for (const item of tokens) {
        if (
          currentRates[item.address]?.timestamp &&
          now - currentRates[item.address].timestamp < this.config.interval
        ) {
          continue;
        }
        if (addresses.includes(item.address)) {
          continue;
        }
        addresses.push(item.address);
      }
      if (chainType === ChainType.Ethereum) {
        const arbMainChainId = this.networks[ChainType.Arbitrum].getMainChainId();
        const arbTokens = allTokens[addressKey]?.[arbMainChainId] || [];
        for (const item of arbTokens) {
          if (!item.l1Address) {
            continue;
          }
          if (
            currentRates[item.l1Address]?.timestamp &&
            now - currentRates[item.l1Address].timestamp < this.config.interval
          ) {
            continue;
          }
          if (addresses.includes(item.l1Address)) {
            continue;
          }
          addresses.push(item.l1Address);
        }
      }
    }
    let success = true;
    if (addresses.length === 0) {
      return { addresses: [], success };
    }
    const newContractExchangeRates: { [address: string]: TokenPrice } = {};
    const price0Addresses: string[] = [];
    for (let i = 0; i <= addresses.length / 150; i++) {
      const sliced_addresses = addresses.slice(i * 150, (i + 1) * 150);
      if (!sliced_addresses?.length) {
        break;
      }
      const pairs = sliced_addresses.join(',');
      const query = `contract_addresses=${pairs}&vs_currencies=usd&include_24hr_change=true`;
      let prices = await safelyExecuteWithTimeout(
        async () => await this.fetchExchangeRate(query, coingecko_path),
        true,
        15000,
      );

      if (!prices) {
        success = false;
        prices = {};
      }
      for (const item of sliced_addresses) {
        const address = toChecksumAddress(item);
        const price = prices[address.toLowerCase()];
        if (price && price.hasOwnProperty('usd') && price.hasOwnProperty('usd_24h_change')) {
          price.timestamp = Date.now();
          newContractExchangeRates[address] = price;
        } else {
          price0Addresses.push(address.toLowerCase());
        }
      }
    }

    const allContractExchangeRates = { ...this.state.allContractExchangeRates };
    allContractExchangeRates[chainType] = { ...currentRates, ...newContractExchangeRates };
    this.update({ allContractExchangeRates });
    return { addresses: price0Addresses, success };
  }

  async extendExchangeRates(price0Addresses: string[], chainType = ChainType.Ethereum) {
    const timestamp = Math.round(Date.now() / 1000 - 86400);
    let blockInfos;
    if (chainType === ChainType.Ethereum) {
      blockInfos = await safelyExecuteWithTimeout(async () => await this.fetchEthBlocks(timestamp), true, 11000);
    } else if (chainType === ChainType.Bsc) {
      blockInfos = await safelyExecuteWithTimeout(async () => await this.fetchBscBlocks(timestamp), true, 11000);
    } else if (chainType === ChainType.Polygon) {
      blockInfos = await safelyExecuteWithTimeout(async () => await this.fetchPolygonBlocks(timestamp), true, 11000);
    }
    const blockNumber = blockInfos?.data?.blocks[0]?.number;
    let extendPrices: CoinGeckoResponse = {};
    for (let i = 0; i <= price0Addresses.length / 100; i++) {
      const sliced_addresses = price0Addresses.slice(i * 100, (i + 1) * 100);
      if (!sliced_addresses?.length) {
        break;
      }
      let graphRep;
      if (chainType === ChainType.Ethereum) {
        graphRep = await safelyExecuteWithTimeout(
          async () => await this.fetchERC20Rate(sliced_addresses, -1),
          true,
          12000 + 40 * sliced_addresses.length,
        );
      } else if (chainType === ChainType.Bsc) {
        graphRep = await safelyExecuteWithTimeout(
          async () => await this.fetchBEP20Rate(sliced_addresses, -1),
          true,
          6000 + 40 * sliced_addresses.length,
        );
      } else if (chainType === ChainType.Polygon) {
        graphRep = await safelyExecuteWithTimeout(
          async () => await this.fetchPRC20Rate(sliced_addresses, -1),
          true,
          12000 + 40 * sliced_addresses.length,
        );
      }
      if (!graphRep) {
        continue;
      }
      const zero_prices = sliced_addresses.reduce((ids: CoinGeckoResponse, address) => {
        ids[address] = { usd: 0, usd_24h_change: 0, timestamp: Date.now() + 60 * 60 * 1000 };
        return ids;
      }, {});
      const prices = this.tokenInfo2Price(graphRep);

      if (blockNumber) {
        let grapRep24h;
        if (chainType === ChainType.Ethereum) {
          grapRep24h = await safelyExecuteWithTimeout(
            async () => await this.fetchERC20Rate(sliced_addresses, parseInt(blockNumber)),
            true,
            12000 + 40 * sliced_addresses.length,
          );
        } else if (chainType === ChainType.Bsc) {
          grapRep24h = await safelyExecuteWithTimeout(
            async () => await this.fetchBEP20Rate(sliced_addresses, parseInt(blockNumber)),
            true,
            6000 + 40 * sliced_addresses.length,
          );
        } else if (chainType === ChainType.Polygon) {
          grapRep24h = await safelyExecuteWithTimeout(
            async () => await this.fetchPRC20Rate(sliced_addresses, parseInt(blockNumber)),
            true,
            12000 + 40 * sliced_addresses.length,
          );
        }
        if (grapRep24h) {
          this.calculate24hRate(prices, grapRep24h);
        }
      }
      extendPrices = { ...extendPrices, ...zero_prices, ...prices };
    }
    const newContractExchangeRates = { ...this.state.allContractExchangeRates[chainType] };

    const items = Object.keys(extendPrices);
    let needUpdate = false;
    for (const item of items) {
      const address = toChecksumAddress(item);
      const price = extendPrices[item];
      if (price && price.usd !== 0) {
        newContractExchangeRates[address] = price;
        needUpdate = true;
      }
    }
    if (!needUpdate) {
      return;
    }
    this.state.allContractExchangeRates[chainType] = newContractExchangeRates;
    this.update({ allContractExchangeRates: { ...this.state.allContractExchangeRates } });
  }

  fixExtendExchangeRates(price0Addresses: string[], chainType: ChainType) {
    if (!price0Addresses || price0Addresses.length <= 0) {
      return;
    }
    const zero_prices = price0Addresses.reduce((ids: CoinGeckoResponse, address) => {
      ids[toChecksumAddress(address)] = { usd: 0, usd_24h_change: 0, timestamp: Date.now() + 60 * 60 * 1000 };
      return ids;
    }, {});

    this.state.allContractExchangeRates[chainType] = {
      ...this.state.allContractExchangeRates[chainType],
      ...zero_prices,
    };
    this.update({ allContractExchangeRates: { ...this.state.allContractExchangeRates } });
  }

  async updateBasicExchangeRates() {
    if (Date.now() - this.config.basic_price_timestamp < this.config.interval) {
      return;
    }
    const ids: string[] = [];
    const typeIds: { [chainType: number]: string } = {};
    for (const type in NetworkConfig) {
      const chainType = Number(type);
      if (NetworkConfig[chainType].Disabled) {
        continue;
      }
      const coingeckoId = NetworkConfig[chainType].CoingeckoId;
      if (coingeckoId) {
        if (!ids.includes(coingeckoId)) {
          ids.push(coingeckoId);
        }
        typeIds[chainType] = coingeckoId;
      }
    }
    ids.push('bitcoin');
    const { url, options } = await getAvailableUrl(this.getBasicPricingURL(ids));
    const prices = await safelyExecuteWithTimeout(async () => await handleFetch(url, options), true, 10000);
    if (!prices) {
      return;
    }
    let loadAll = true;
    for (const id of ids) {
      if (!prices[id]) {
        loadAll = false;
        break;
      }
    }
    if (loadAll) {
      this.configure({ basic_price_timestamp: Date.now() }, false, false);
    }
    const allCurrencyPrice = { ...this.state.allCurrencyPrice };
    for (const type in typeIds) {
      const chainType = Number(type);
      allCurrencyPrice[chainType] = prices[typeIds[chainType]];
    }
    const bitcoinPrices = 1 / prices.bitcoin.usd;
    this.update({
      usdRates: { ...this.state.usdRates, XBT: bitcoinPrices },
      bitcoinPrice: prices.bitcoin,
      allCurrencyPrice,
    });
    if (this.state.currencyCode === 'XBT') {
      this.update({ currencyCodeRate: bitcoinPrices });
    }
  }

  setCurrencyCode(code: string) {
    code = code?.toUpperCase();
    const rate = this.state.usdRates[code];
    if (rate) {
      this.update({ currencyCode: code, currencyCodeRate: rate });
    } else {
      this.pollUsdRates();
      this.update({ currencyCode: code });
    }
  }

  async pollUsdRates() {
    if (this.update_Rates_counter > 1) {
      return;
    }
    this.update_Rates_counter += 1;
    this.update_Rates_handle && clearTimeout(this.update_Rates_handle);
    const releaseLock = await this.mutexRate.acquire();
    await this.updateUsdRates();
    releaseLock();
    this.update_Rates_counter -= 1;
    if (this.update_Rates_counter > 0) {
      return;
    }
    let subTime = Date.now() - this.state.obtainRateTimestamp;
    subTime = 10 * 60 * 60 * 1000 - subTime;
    subTime = subTime <= 30000 ? 30000 : subTime;
    this.update_Rates_handle = setTimeout(() => {
      this.pollUsdRates();
    }, subTime);
  }

  async updateUsdRates() {
    if (Date.now() - this.state.obtainRateTimestamp < 10 * 60 * 60 * 1000) {
      return;
    }
    await handleFetch(this.getUsdRateURL())
      .then((json) => {
        if (json && json.result === 'success') {
          const { rates } = json;
          if (rates) {
            this.update({ usdRates: { ...this.state.usdRates, ...rates }, obtainRateTimestamp: Date.now() });
            if (rates[this.state.currencyCode]) {
              this.update({ currencyCodeRate: rates[this.state.currencyCode] });
            }
          }
        } else {
          logInfo('PPYang updateUsdRates fail, json:', json);
        }
      })
      .catch((e) => logWarn('PPYang updateUsdRates fail, error:', e));
  }
}

export default TokenRatesController;
