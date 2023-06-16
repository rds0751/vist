import { platform } from 'os';
import { addHexPrefix, BN, bufferToHex, isValidAddress } from 'ethereumjs-util';
import { stripHexPrefix } from 'ethjs-util';
import { ethErrors } from 'eth-rpc-errors';
import { TYPED_MESSAGE_SCHEMA, typedSignatureHash } from 'eth-sig-util';
import jsonschema from 'jsonschema';
import RNFS from 'react-native-fs';
import { fileAsyncTransport, logger } from 'react-native-logs';
import { utils, BigNumber as EthersBigNumber } from 'ethers';
import BigNumber from 'bignumber.js';
import { Transaction, FetchAllOptions } from './transaction/TransactionController';
import { MessageParams } from './message-manager/MessageManager';
import { PersonalMessageParams } from './message-manager/PersonalMessageManager';
import { TypedMessageParams } from './message-manager/TypedMessageManager';
import { Token } from './assets/TokenRatesController';
import isIPFS from 'is-ipfs';
import { NetworkConfig, ChainType } from './Config';

const hexRe = /^[0-9A-Fa-f]+$/gu;

const NORMALIZERS: { [param in keyof Transaction]: any } = {
  data: (data: string) => addHexPrefix(data),
  from: (from: string) => addHexPrefix(from).toLowerCase(),
  gas: (gas: string) => addHexPrefix(gas),
  gasPrice: (gasPrice: string) => addHexPrefix(gasPrice),
  nonce: (nonce: string) => addHexPrefix(nonce),
  to: (to: string) => addHexPrefix(to).toLowerCase(),
  value: (value: string) => addHexPrefix(value),
  chainId: (value: number) => Number(value),
  maxFeePerGas: (maxFeePerGas: string) => addHexPrefix(maxFeePerGas),
  maxPriorityFeePerGas: (maxPriorityFeePerGas: string) => addHexPrefix(maxPriorityFeePerGas),
  estimatedBaseFee: (maxPriorityFeePerGas: string) => addHexPrefix(maxPriorityFeePerGas),
};

export enum CollectibleType {
  UNKNOWN = 0,
  ERC721 = 1,
  ERC1155 = 2,
}

/**
 * Converts a BN object to a hex string with a '0x' prefix
 *
 * @param inputBn - BN instance to convert to a hex string
 * @returns - '0x'-prefixed hex string
 *
 */
export function BNToHex(inputBn: any) {
  return addHexPrefix(inputBn.toString(16));
}

/**
 * Used to multiply a BN by a fraction
 *
 * @param targetBN - Number to multiply by a fraction
 * @param numerator - Numerator of the fraction multiplier
 * @param denominator - Denominator of the fraction multiplier
 * @returns - Product of the multiplication
 */
export function fractionBN(targetBN: any, numerator: number | string, denominator: number | string) {
  const numBN = new BN(numerator);
  const denomBN = new BN(denominator);
  return targetBN.mul(numBN).div(denomBN);
}

export function getTronAccountUrl(chainId: string, address: string): string {
  if (chainId === '123454321') {
    return `https://api.trongrid.io/v1/accounts/${address}`;
  }
  return `https://api.shasta.trongrid.io/v1/accounts/${address}`;
}

export async function getScanApiByType(
  type: ChainType,
  chainId: string,
  address: string,
  action: string,
  fromBlock?: string,
  etherscanApiKey?: string,
) {
  let apiUrl;
  const networks = NetworkConfig[type]?.Networks;
  if (!networks) {
    return undefined;
  }
  for (const network in networks) {
    if (chainId === networks[network].provider.chainId) {
      apiUrl = networks[network].ExplorerApiUrl;
      break;
    }
  }
  let scanUrl = `${apiUrl}/api?module=account&action=${action}&address=${address}&tag=latest&page=1`;
  if (ChainType.Heco === type) {
    if (!fromBlock) {
      fromBlock = '0';
    }
    scanUrl += `&startblock=${fromBlock}`;
    scanUrl += `&endblock=${99999999}`;
  } else {
    if (fromBlock) {
      scanUrl += `&startBlock=${fromBlock}`;
    }
  }

  if (etherscanApiKey) {
    scanUrl += `&apikey=${etherscanApiKey}`;
  }

  if (NetworkConfig[type].NeedAvailableUrl) {
    return await getAvailableUrl(scanUrl);
  }
  return {
    url: scanUrl,
    options: {
      method: 'GET',
      headers: getBaseHeaders(),
    },
  };
}

export function getBaseHeaders() {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Connection: 'keep-alive',
    'User-Agent':
      'Mozilla/5.0 (Linux; Android 10; Android SDK built for x86 Build/OSM1.180201.023) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.92 Mobile Safari/537.36',
  };
}

/**
 * Handles the fetch of incoming transactions
 *
 * @param type
 * @param chainId
 * @param address - Address to get the transactions from
 * @param loadToken
 * @param opt? - Object that can contain fromBlock and Etherscan service API key
 * @returns - Responses for both ETH and ERC20 token transactions
 */
export async function handleTransactionFetch(
  type: ChainType,
  chainId: string,
  address: string,
  loadToken: boolean,
  txInternal: boolean,
  opt?: FetchAllOptions,
): Promise<{ [result: string]: [] }> {
  let action = 'txlist';
  if (txInternal) {
    action = 'txlistinternal';
  } else if (loadToken) {
    action = 'tokentx';
  }
  const api = await getScanApiByType(type, chainId, address, action, opt?.fromBlock, opt?.etherscanApiKey);
  if (!api) {
    return { result: [] };
  }
  let etherscanTxResponse;
  try {
    const response = await timeoutFetch(api.url, api.options, 20000);
    etherscanTxResponse = await response.json();
  } catch (e) {
    logInfo(`leon.w@fetch ${api.url} failed. error=${e}`);
  }
  if (!etherscanTxResponse || etherscanTxResponse.status === '0' || !Array.isArray(etherscanTxResponse.result)) {
    etherscanTxResponse = { result: [] };
  }
  return etherscanTxResponse;
}

/**
 * Converts a hex string to a BN object
 *
 * @param inputHex - Number represented as a hex string
 * @returns - A BN instance
 *
 */
export function hexToBN(inputHex: string) {
  return new BN(stripHexPrefix(inputHex), 16);
}

/**
 * A helper function that converts hex data to human readable string
 *
 * @param hex - The hex string to convert to string
 * @returns - A human readable string conversion
 *
 */
export function hexToText(hex: string) {
  try {
    const stripped = stripHexPrefix(hex);
    const buff = Buffer.from(stripped, 'hex');
    return buff.toString('utf8');
  } catch (e) {
    /* istanbul ignore next */
    return hex;
  }
}

/**
 * Normalizes properties on a Transaction object
 *
 * @param transaction - Transaction object to normalize
 * @returns - Normalized Transaction object
 */
export function normalizeTransaction(transaction: Transaction) {
  const normalizedTransaction: Transaction = { from: '', chainId: 0 };
  let key: keyof Transaction;
  for (key in NORMALIZERS) {
    if (transaction[key as keyof Transaction]) {
      normalizedTransaction[key] = NORMALIZERS[key](transaction[key]) as never;
    }
  }
  return normalizedTransaction;
}

/**
 * Execute and return an asynchronous operation without throwing errors
 *
 * @param operation - Function returning a Promise
 * @param logError - Determines if the error should be logged
 * @param retry - Function called if an error is caught
 * @returns - Promise resolving to the result of the async operation
 */
export async function safelyExecute(operation: () => Promise<any>, printLog = true, retry?: (error: Error) => void) {
  try {
    return await operation();
  } catch (error) {
    /* istanbul ignore next */
    if (printLog) {
      logDebug(`safelyExecute: ${error}`);
    }
    retry?.(error);
    return undefined;
  }
}

/**
 * Execute and return an asynchronous operation with a timeout
 *
 * @param operation - Function returning a Promise
 * @param logError - Determines if the error should be logged
 * @param retry - Function called if an error is caught
 * @param timeout - Timeout to fail the operation
 * @returns - Promise resolving to the result of the async operation
 */
export async function safelyExecuteWithTimeout(operation: () => Promise<any>, printLog = true, timeout = 500) {
  try {
    return await Promise.race([
      operation(),
      new Promise<void>((_, reject) =>
        setTimeout(() => {
          reject(new Error(`timeout: ${timeout}`));
        }, timeout),
      ),
    ]);
  } catch (error) {
    /* istanbul ignore next */
    if (printLog) {
      logDebug(`safelyExecuteWithTimeout: ${error}`);
    }
    return undefined;
  }
}

/**
 * Validates a Transaction object for required properties and throws in
 * the event of any validation error.
 *
 * @param transaction - Transaction object to validate
 */
export function validateTransaction(transaction: Transaction) {
  if (!transaction.from || typeof transaction.from !== 'string' || !isValidAddress(transaction.from)) {
    throw new Error(`Invalid "from" address: ${transaction.from} must be a valid string.`);
  }
  if (transaction.to === '0x' || transaction.to === undefined) {
    if (transaction.data) {
      delete transaction.to;
    } else {
      throw new Error(`Invalid "to" address: ${transaction.to} must be a valid string.`);
    }
  } else if (transaction.to !== undefined && !isValidAddress(transaction.to)) {
    throw new Error(`Invalid "to" address: ${transaction.to} must be a valid string.`);
  }
  if (transaction.value !== undefined) {
    const value = transaction.value.toString();
    if (value.includes('-')) {
      throw new Error(`Invalid "value": ${value} is not a positive number.`);
    }
    if (value.includes('.')) {
      throw new Error(`Invalid "value": ${value} number must be denominated in wei.`);
    }
    const intValue = parseInt(transaction.value, 10);
    const isValid =
      Number.isFinite(intValue) && !Number.isNaN(intValue) && !isNaN(Number(value)) && Number.isSafeInteger(intValue);
    if (!isValid) {
      throw new Error(`Invalid "value": ${value} number must be a valid number.`);
    }
  }
  if (transaction.chainId === undefined) {
    throw new Error('Invalid "chainId": Transaction must have chainId');
  }
}

/**
 * A helper function that converts rawmessageData buffer data to a hex, or just returns the data if
 * it is already formatted as a hex.
 *
 * @param data - The buffer data to convert to a hex
 * @returns - A hex string conversion of the buffer data
 *
 */
export function normalizeMessageData(data: string) {
  try {
    const stripped = stripHexPrefix(data);
    if (stripped.match(hexRe)) {
      return addHexPrefix(stripped);
    }
  } catch (e) {
    /* istanbul ignore next */
  }
  return bufferToHex(Buffer.from(data, 'utf8'));
}

/**
 * Validates a PersonalMessageParams and MessageParams objects for required properties and throws in
 * the event of any validation error.
 *
 * @param messageData - PersonalMessageParams object to validate
 */
export function validateSignMessageData(messageData: PersonalMessageParams | MessageParams) {
  if (!messageData.from || typeof messageData.from !== 'string' || !isValidAddress(messageData.from)) {
    throw new Error(`Invalid "from" address: ${messageData.from} must be a valid string.`);
  }
  if (!messageData.data || typeof messageData.data !== 'string') {
    throw new Error(`Invalid message "data": ${messageData.data} must be a valid string.`);
  }
}

/**
 * Validates a TypedMessageParams object for required properties and throws in
 * the event of any validation error for eth_signTypedMessage_V1.
 *
 * @param messageData - TypedMessageParams object to validate
 * @param activeChainId - Active chain id
 */
export function validateTypedSignMessageDataV1(messageData: TypedMessageParams) {
  if (!messageData.from || typeof messageData.from !== 'string' || !isValidAddress(messageData.from)) {
    throw new Error(`Invalid "from" address: ${messageData.from} must be a valid string.`);
  }
  if (!messageData.data || !Array.isArray(messageData.data)) {
    throw new Error(`Invalid message "data": ${messageData.data} must be a valid array.`);
  }
  try {
    // typedSignatureHash will throw if the data is invalid.
    typedSignatureHash(messageData.data as any);
  } catch (e) {
    throw new Error(`Expected EIP712 typed data.`);
  }
}

/**
 * Validates a TypedMessageParams object for required properties and throws in
 * the event of any validation error for eth_signTypedMessage_V3.
 *
 * @param messageData - TypedMessageParams object to validate
 */
export function validateTypedSignMessageDataV3(messageData: TypedMessageParams) {
  if (!messageData.from || typeof messageData.from !== 'string' || !isValidAddress(messageData.from)) {
    throw new Error(`Invalid "from" address: ${messageData.from} must be a valid string.`);
  }
  if (!messageData.data || typeof messageData.data !== 'string') {
    throw new Error(`Invalid message "data": ${messageData.data} must be a valid array.`);
  }
  let data;
  try {
    data = JSON.parse(messageData.data);
  } catch (e) {
    throw new Error('Data must be passed as a valid JSON string.');
  }
  const validation = jsonschema.validate(data, TYPED_MESSAGE_SCHEMA);
  if (validation.errors.length > 0) {
    throw new Error('Data must conform to EIP-712 schema. See https://git.io/fNtcx.');
  }
}

/**
 * Validates a ERC20 token to be added with EIP747.
 *
 * @param token - Token object to validate
 */
export function validateTokenToWatch(token: Token) {
  const { address, symbol, decimals } = token;
  if (!address || !symbol || typeof decimals === 'undefined') {
    throw ethErrors.rpc.invalidParams(`Must specify address, symbol, and decimals.`);
  }
  if (typeof symbol !== 'string') {
    throw ethErrors.rpc.invalidParams(`Invalid symbol: not a string.`);
  }
  if (symbol.length > 11) {
    throw ethErrors.rpc.invalidParams(`Invalid symbol "${symbol}": longer than 11 characters.`);
  }
  const numDecimals = parseInt((decimals as unknown) as string, 10);
  if (isNaN(numDecimals) || numDecimals > 36 || numDecimals < 0) {
    throw ethErrors.rpc.invalidParams(`Invalid decimals "${decimals}": must be 0 <= 36.`);
  }
  if (!isValidAddress(address)) {
    throw ethErrors.rpc.invalidParams(`Invalid address "${address}".`);
  }
}

/**
 * Returns wether the given code corresponds to a smart contract
 *
 * @returns {string} - Corresponding code to review
 */
export function isSmartContractCode(code: string) {
  /* istanbul ignore if */
  if (!code) {
    return false;
  }
  // Geth will return '0x', and ganache-core v2.2.1 will return '0x0'
  const smartContractCode = code !== '0x' && code !== '0x0' && code !== 'null or contain null';
  return smartContractCode;
}

/**
 * Execute fetch and verify that the response was successful
 *
 * @param request - Request information
 * @param options - Options
 * @returns - Promise resolving to the fetch response
 */
export async function successfulFetch(request: string, options?: RequestInit) {
  const response = await fetch(request, options);
  if (!response.ok) {
    throw new Error(`Fetch failed with status '${response.status}' for request '${request}'`);
  }
  return response;
}

/**
 * Execute fetch and return object response
 *
 * @param request - Request information
 * @param options - Options
 * @returns - Promise resolving to the result object of fetch
 */
export async function handleFetch(request: string, options?: RequestInit) {
  const response = await successfulFetch(request, options);
  try {
    const object = await response.json();
    return object;
  } catch (e) {
    logDebug(`leon.w@handleFetch@${request} failed response=`, response);
    throw e;
  }
}

/**
 * Fetch that fails after timeout
 *
 * @param url - Url to fetch
 * @param options - Options to send with the request
 * @param timeout - Timeout to fail request
 *
 * @returns - Promise resolving the request
 */
export async function timeoutFetch(url: string, options?: RequestInit, timeout = 500): Promise<Response> {
  return Promise.race([
    successfulFetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => {
        reject(new Error('timeout'));
      }, timeout),
    ),
  ]);
}

/**
 * Wrapper method to handle EthQuery requests
 *
 * @param ethQuery - EthQuery object initialized with a provider
 * @param method - Method to request
 * @param args - Arguments to send
 *
 * @returns - Promise resolving the request
 */
export function query(ethQuery: any, method: string, args: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    ethQuery[method](...args, (error: Error, result: any) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
}

/**
 * Checks if a transaction is EIP-1559 by checking for the existence of
 * maxFeePerGas and maxPriorityFeePerGas within its parameters
 *
 * @param transaction - Transaction object to add
 * @returns - Boolean that is true if the transaction is EIP-1559 (has maxFeePerGas and maxPriorityFeePerGas), otherwise returns false
 */
export const isEIP1559Transaction = (transaction: Transaction): boolean => {
  const hasOwnProp = (obj: Transaction, key: string) => Object.prototype.hasOwnProperty.call(obj, key);
  return hasOwnProp(transaction, 'maxFeePerGas') && hasOwnProp(transaction, 'maxPriorityFeePerGas');
};

export function bitOR(b1: number, b2: number) {
  // eslint-disable-next-line no-bitwise
  return b1 | b2;
}

export function bitAND(b1: number, b2: number) {
  // eslint-disable-next-line no-bitwise
  return b1 & b2;
}

export function isRpcChainType(chainType: number) {
  return chainType > ChainType.RPCBase;
}

const ts = new Date().getTime();

const config = {
  transport: fileAsyncTransport,
  transportOptions: {
    colors: `ansi`,
    FS: RNFS,
    fileName: `log_${ts}.txt`,
    filePath: platform() === 'android' ? RNFS.ExternalDirectoryPath : RNFS.DocumentDirectoryPath,
  },
};

let AgentUtil: any = null;
export function setAgentUtil(agent: any) {
  AgentUtil = agent;
}

const g_file_log = logger.createLogger(config);
let g_is_file_log = false;
let g_use_test_server = false;

export function setUseTestServer(testServer: boolean) {
  g_use_test_server = testServer;
  g_is_file_log = testServer;
}

export function useTestServer() {
  return g_use_test_server;
}

export function logInfo(...data: any[]) {
  if (AgentUtil) {
    AgentUtil.logInfo(...data);
  } else if (g_is_file_log) {
    g_file_log.info(data);
  } else {
    console.info(data);
  }
}

export function logDebug(...data: any[]) {
  if (AgentUtil) {
    AgentUtil.logDebug(...data);
  } else if (g_is_file_log) {
    g_file_log.debug(data);
  } else {
    console.log(data);
  }
}

export function logWarn(...data: any[]) {
  if (AgentUtil) {
    AgentUtil.logWarn(...data);
  } else if (g_is_file_log) {
    g_file_log.warn(data);
  } else {
    console.warn(data);
  }
}

export function logError(...data: any[]) {
  if (AgentUtil) {
    AgentUtil.logError(...data);
  } else if (g_is_file_log) {
    g_file_log.error(data);
  } else {
    console.error(data);
  }
}

export const convertPriceToDecimal = (value: string | undefined): number =>
  parseInt(value === undefined ? '0x0' : value, 16);

export const getIncreasedPriceHex = (value: number, rate: number): string =>
  addHexPrefix(`${parseInt(`${value * rate}`, 10).toString(16)}`);

export const getIncreasedPriceFromExisting = (value: string | undefined, rate: number): string => {
  return getIncreasedPriceHex(convertPriceToDecimal(value), rate);
};

export async function queryEIP1559Compatibility(ethQuery: any): Promise<boolean> {
  if (typeof ethQuery?.sendAsync !== 'function') {
    return Promise.resolve(false);
  }
  return new Promise((resolve, reject) => {
    ethQuery.sendAsync({ method: 'eth_getBlockByNumber', params: ['latest', false] }, (error: Error, block: any) => {
      if (error) {
        reject(error);
      } else {
        const isEIP1559Compatible = typeof block.baseFeePerGas !== 'undefined';
        resolve(isEIP1559Compatible);
      }
    });
  });
}

let etherscanAvailable = true;
let etherscanAvailableChecked = false;
export async function isEtherscanAvailableAsync() {
  // eslint-disable-next-line no-unmodified-loop-condition
  while (!etherscanAvailableChecked) {
    await new Promise((resolve) => setTimeout(() => resolve(true), 500));
  }
  return etherscanAvailable;
}

export function isEtherscanAvailable() {
  return etherscanAvailable;
}

export function isEtherscanAvailableChecked() {
  return etherscanAvailableChecked;
}

export async function checkEtherscanAvailable(address: string, etherToken: string) {
  let res = null;
  await safelyExecuteWithTimeout(
    async () => {
      const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherToken}`;
      res = await handleFetch(url);
    },
    true,
    3000,
  );
  if (res) {
    return true;
  }
  return false;
}

export function setEtherscanAvailable(etherscan_available: boolean) {
  etherscanAvailable = etherscan_available;
  etherscanAvailableChecked = true;
}

export async function getAvailableUrl(url: string): Promise<{ url: string; options: RequestInit }> {
  let options: RequestInit = { method: 'GET' };
  if (!(await isEtherscanAvailableAsync())) {
    const formData = new FormData();
    formData.append('url', url);
    options = { method: 'POST', body: formData, headers: getBaseHeaders() };

    url = 'https://pali.pollum.cloud/proxy-json';
  }
  return { url, options };
}

export const tlc = (str: string) => str?.toLowerCase?.();

export const toLowerCaseEquals = (a: string, b: string) => {
  if (!a && !b) {
    return false;
  }
  return tlc(a) === tlc(b);
};

export function isIPFSUrl(url: string): boolean {
  if (!url) {
    return false;
  }
  return isIPFS.ipfsUrl(url) || isIPFS.ipfsPath(url) || isIPFS.cid(url) || url.startsWith('ipfs:');
}

export function makeIPFSUrl(url: string, ipfsHost = 'https://infura-ipfs.io/ipfs/') {
  if (isIPFS.cid(url)) return `${ipfsHost}${url}`;

  const subUrls = url.split('/');
  for (let i = subUrls.length - 1; i >= 0; i--) {
    if (isIPFS.cid(subUrls[i])) {
      return `${ipfsHost}${subUrls[i]}`;
    }
  }
  return url;
}

export function resolveURIWithTokenId(uri: string, tokenId: string) {
  const hexChainId = `0x${new BigNumber(tokenId, 10).toString(16)}`;
  const paddedTokenId = utils.hexZeroPad(hexChainId, 32).replace('0x', '');
  // eslint-disable-next-line require-unicode-regexp
  return uri.replace(/\{id\}/gi, paddedTokenId);
}

// https://eips.ethereum.org/EIPS/eip-1155
export function resolveURIWithLocale(uri: string, locale: string) {
  // eslint-disable-next-line require-unicode-regexp
  return uri.replace(/\{locale\}/gi, locale);
}

export function resolveURI(uri: string, tokenId: string, locale: string) {
  return resolveURIWithLocale(resolveURIWithTokenId(uri, tokenId), locale);
}

export function getEthereumNetworkType(chainId: string) {
  chainId = chainId?.toString();
  switch (chainId) {
    case '1':
      return 'mainnet';
    case '42':
      return 'kovan';
    case '4':
      return 'rinkeby';
    case '5':
      return 'goerli';
    case '3':
      return 'ropsten';
    default:
      return '';
  }
}

export function getConfigChainType(chainId: string) {
  for (const type in NetworkConfig) {
    const networks = NetworkConfig[type].Networks;
    if (!networks) {
      continue;
    }
    for (const name in networks) {
      if (networks[name].provider?.chainId === chainId) {
        return Number(type);
      }
    }
  }
  return undefined;
}

export function rehydrate(name: string, state: any) {
  const new_state = { ...state };
  switch (name) {
    case 'TokenBalancesController': {
      if (new_state.allContractBalances) {
        for (const key in new_state.allContractBalances) {
          for (const key2 in new_state.allContractBalances[key]) {
            for (const key3 in new_state.allContractBalances[key][key2]) {
              if (new_state.allContractBalances[key][key2][key3]) {
                new_state.allContractBalances[key][key2][key3] = hexToBN(
                  String(new_state.allContractBalances[key][key2][key3]),
                );
              }
            }
          }
        }
      }
      break;
    }
    case 'ArbContractController': {
      if (new_state.withdraws) {
        for (const key in new_state.withdraws) {
          if (new_state.withdraws[key].batchNumber) {
            new_state.withdraws[key].batchNumber = EthersBigNumber.from(new_state.withdraws[key].batchNumber);
          }
          if (new_state.withdraws[key].indexInBatch) {
            new_state.withdraws[key].indexInBatch = EthersBigNumber.from(new_state.withdraws[key].indexInBatch);
          }
          if (new_state.withdraws[key].token?.amount) {
            new_state.withdraws[key].token.amount = hexToBN(String(new_state.withdraws[key].token.amount));
          }
        }
      }
      break;
    }
    case 'AssetsController': {
      if (!new_state.allSmartContract && new_state.allTokens) {
        new_state.allSmartContract = {};
        for (const address in new_state.allTokens) {
          if (new_state.allTokens[address]) {
            for (const chainId in new_state.allTokens[address]) {
              if (new_state.allTokens[address][chainId]) {
                const nowContract = new_state.allSmartContract[chainId] || [];
                new_state.allTokens[address][chainId].forEach((token: any) => {
                  if (!nowContract.find((sc: any) => sc.address === address)) {
                    nowContract.push({ address: token.address, isSmartContract: true });
                  }
                });
                new_state.allSmartContract[chainId] = nowContract;
              }
            }
          }
        }
      }
      break;
    }
    case 'AssetsDataModel': {
      if (new_state.assets) {
        for (const key in new_state.assets) {
          for (const key2 in new_state.assets[key]) {
            if (new_state.assets[key][key2].amount) {
              new_state.assets[key][key2].amount = hexToBN(String(new_state.assets[key][key2].amount));
            }
            if (new_state.assets[key][key2].batchNumber) {
              new_state.assets[key][key2].batchNumber = EthersBigNumber.from(new_state.assets[key][key2].batchNumber);
            }
            if (new_state.assets[key][key2].indexInBatch) {
              new_state.assets[key][key2].indexInBatch = EthersBigNumber.from(new_state.assets[key][key2].indexInBatch);
            }
          }
        }
      }
      break;
    }
    case 'CollectiblesController': {
      if (new_state.allCollectibles) {
        for (const key in new_state.allCollectibles) {
          for (const key2 in new_state.allCollectibles[key]) {
            if (new_state.allCollectibles[key][key2]) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              for (const collectible of new_state.allCollectibles[key][key2]) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                collectible.balanceOf = new BigNumber(collectible.balanceOf);
              }
            }
          }
        }
      }
      break;
    }
    case 'PolygonContractController': {
      if (new_state.withdraws) {
        for (const key in new_state.withdraws) {
          if (new_state.withdraws[key].token?.amount) {
            new_state.withdraws[key].token.amount = hexToBN(String(new_state.withdraws[key].token.amount));
          }
        }
      }
      break;
    }
    default:
      break;
  }
  return new_state;
}

export default {
  BNToHex,
  fractionBN,
  query,
  handleFetch,
  hexToBN,
  hexToText,
  isSmartContractCode,
  normalizeTransaction,
  safelyExecute,
  safelyExecuteWithTimeout,
  successfulFetch,
  timeoutFetch,
  validateTokenToWatch,
  validateTransaction,
  validateTypedSignMessageDataV1,
  validateTypedSignMessageDataV3,
  bitOR,
  bitAND,
  logDebug,
  logInfo,
  logWarn,
  logError,
  isEtherscanAvailableAsync,
  isEtherscanAvailable,
  isEtherscanAvailableChecked,
  checkEtherscanAvailable,
  setEtherscanAvailable,
  isRpcChainType,
  rehydrate,
  setAgentUtil,
  getScanApiByType,
  isIPFSUrl,
  makeIPFSUrl,
};
