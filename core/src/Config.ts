export enum ChainType {
  All = 0,
  Ethereum = 0x01,
  Arbitrum = 0x02,
  Bsc = 0x04,
  Polygon = 0x08,
  Tron = 0x10,
  Heco = 0x20,
  Optimism = 0x40,
  Avax = 0x80,
  Syscoin = 0x100,
  RPCBase = 0x10000000000000,
}

export const defaultEnabledChains = [ChainType.Ethereum, ChainType.Polygon, ChainType.Arbitrum, ChainType.Bsc, ChainType.Avax, ChainType.Syscoin];
export const allChains = [...defaultEnabledChains, ChainType.Optimism, ChainType.Heco];

/**
 * multiple chain type
 * [ChainType]: {
 *   Disabled: true or false      //close or open chain
 *   MainChainId：string          //main chain ID
 *   Networks: object              //network config
 * }
 **/
export const NetworkConfig: { [type: number]: any } = {
  [ChainType.Ethereum]: {
    Name: "Ethereum",
    MainChainId: '1',
    UseInfura: true,
    Disabled: false,
    DefiTokenChain: [],
    CoingeckoId: 'ethereum',
    SwapUrl: 'https://bafybeidlvfo3j6lbrq56uultqp5urpirthugtwcrjc642jci4ntkko5ra4.ipfs.cf-ipfs.com/#/swap',
    SwapTokenUrl: 'https://bafybeidlvfo3j6lbrq56uultqp5urpirthugtwcrjc642jci4ntkko5ra4.ipfs.cf-ipfs.com/#/swap?inputCurrency=',
    CurrencyLogo: 'https://cdn.gopocket.finance/files/eth_logo.png',
    NeedAvailableUrl: true,
    OtherCoinInfoUrl: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2',
    SushiswapGraphUrl: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
    Networks: {
      "Ethereum Mainnet": {
        provider: {
          "rpcTarget": "",
          "type": "Ethereum Mainnet",
          "chainId": "1",
          "ticker": "ETH",
          "nickname": "Ethereum"
        },
        infuraType: "mainnet",
        ExplorerUrl: 'https://etherscan.io',
        ExplorerApiUrl: 'https://api.etherscan.io',
      },
      "Ropsten": {
        provider: {
          "rpcTarget": "",
          "type": "Ropsten",
          "chainId": "3",
          "ticker": "ETH",
          "nickname": "Ethereum"
        },
        infuraType: "ropsten",
        ExplorerUrl: 'https://ropsten.etherscan.io',
        ExplorerApiUrl: 'https://api-ropsten.etherscan.io',
      },
      "Kovan": {
        provider: {
          "rpcTarget": "",
          "type": "Kovan",
          "chainId": "42",
          "ticker": "ETH",
          "nickname": "Ethereum"
        },
        infuraType: "kovan",
        ExplorerUrl: 'https://kovan.etherscan.io',
        ExplorerApiUrl: 'https://api-kovan.etherscan.io',
      },
      "Rinkeby": {
        provider: {
          "rpcTarget": "",
          "type": "Rinkeby",
          "chainId": "4",
          "ticker": "ETH",
          "nickname": "Ethereum"
        },
        infuraType: "rinkeby",
        ExplorerUrl: 'https://rinkeby.etherscan.io',
        ExplorerApiUrl: 'https://api-rinkeby.etherscan.io',
      },
      "Goerli": {
        provider: {
          "rpcTarget": "",
          "type": "Goerli",
          "chainId": "5",
          "ticker": "ETH",
          "nickname": "Ethereum"
        },
        infuraType: "goerli",
        ExplorerUrl: 'https://goerli.etherscan.io',
        ExplorerApiUrl: 'https://api-goerli.etherscan.io',
      },
    }
  },
  [ChainType.Polygon]: {
    Name: "Polygon",
    MainChainId: '137',
    UseInfura: true,
    Disabled: false,
    DefiTokenChain: ['matic'],
    CoingeckoId: 'matic-network',
    SwapUrl: 'https://quickswap.exchange/#/swap',
    SwapTokenUrl: 'https://quickswap.exchange/#/swap?inputCurrency=',
    CurrencyLogo: 'https://cdn.gopocket.finance/files/matic_network_logo.png',
    NeedAvailableUrl: true,
    OtherCoinInfoUrl: 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06',
    SushiswapGraphUrl: 'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange',
    Networks: {
      "Polygon Mainnet": {
        "provider": {
          "rpcTarget": "https://rpc-mainnet.maticvigil.com",
          "type": "Polygon Mainnet",
          "chainId": "137",
          "ticker": "MATIC",
          "nickname": "Polygon"
        },
        "infuraType": "polygon-mainnet",
        ExplorerUrl: 'https://polygonscan.com',
        ExplorerApiUrl: 'https://api.polygonscan.com',
        "partnerChainId": "1",
        "DepositManagerProxy": "0x401F6c983eA34274ec46f84D70b31C151321188b",
        "Tokens": {
          "MaticToken": "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
          "TestToken": "0x3db715989dA05C1D17441683B5b41d4510512722",
          "RootERC721": "0x96CDDF45C0Cd9a59876A2a29029d7c54f6e54AD3",
          "MaticWeth": "0xa45b966996374E9e65ab991C6FE4Bfce3a56DDe8"
        },
        "RootChainManagerProxy": "0xA0c68C638235ee32657e8f720a23ceC1bFc77C77",
        "MaticWETH": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        "MaticTokenMatic": "0x0000000000000000000000000000000000001010",
      },
      "Polygon Testnet": {
        "provider": {
          "rpcTarget": "https://rpc-mumbai.matic.today",
          "type": "Polygon Testnet",
          "chainId": "80001",
          "ticker": "MATIC",
          "nickname": "Polygon"
        },
        "infuraType": "polygon-mumbai",
        ExplorerUrl: 'https://mumbai.polygonscan.com',
        ExplorerApiUrl: 'https://api-testnet.polygonscan.com',
        "partnerChainId": "5",
        "DepositManagerProxy": "0x7850ec290A2e2F40B82Ed962eaf30591bb5f5C96",
        "Tokens": {
          "MaticToken": "0x499d11E0b6eAC7c0593d8Fb292DCBbF815Fb29Ae",
          "TestToken": "0x3f152B63Ec5CA5831061B2DccFb29a874C317502",
          "RootERC721": "0xfA08B72137eF907dEB3F202a60EfBc610D2f224b",
          "MaticWeth": "0x60D4dB9b534EF9260a88b0BED6c486fe13E604Fc"
        },
        "RootChainManagerProxy": "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74",
        "MaticWETH": "0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa",
        "MaticTokenMatic": "0x0000000000000000000000000000000000001010",
      }
    }
  },
  [ChainType.Bsc]: {
    Name: "Bsc",
    MainChainId: '56',
    UseInfura: false,
    Disabled: false,
    DefiTokenChain: ['bsc'],
    CoingeckoId: 'wbnb',
    SwapUrl: 'https://exchange.pancakeswap.finance/#/swap',
    SwapTokenUrl: 'https://exchange.pancakeswap.finance/#/swap?inputCurrency=',
    CurrencyLogo: 'https://cdn.gopocket.finance/files/bnb.png',
    NeedAvailableUrl: true,
    OtherCoinInfoUrl: 'https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2',
    SushiswapGraphUrl: 'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange',
    Networks: {
      "BSC Mainnet": {
        "provider": {
          "rpcTarget": "https://bsc-dataseed1.defibit.io/",
          "type": "BSC Mainnet",
          "chainId": "56",
          "ticker": "BNB",
          "nickname": "Biannce"
        },
        rpcTargets: [
          'https://bsc-dataseed.binance.org/',
          'https://bsc-dataseed1.defibit.io/',
          'https://bsc-dataseed1.ninicoin.io/',
          'https://bsc-dataseed2.defibit.io/',
          'https://bsc-dataseed3.defibit.io/',
          'https://bsc-dataseed4.defibit.io/',
          'https://bsc-dataseed2.ninicoin.io/',
          'https://bsc-dataseed3.ninicoin.io/',
          'https://bsc-dataseed4.ninicoin.io/',
          'https://bsc-dataseed1.binance.org/',
          'https://bsc-dataseed2.binance.org/',
          'https://bsc-dataseed3.binance.org/',
          'https://bsc-dataseed4.binance.org/',
          'https://binance.ankr.com/',
          'https://rpc.ankr.com/bsc',
          'https://bscrpc.com',
          'https://bsc.mytokenpocket.vip',
          'https://binance.nodereal.io'
        ],
        ExplorerUrl: 'https://bscscan.com',
        ExplorerApiUrl: 'https://api.bscscan.com',
      },
      "BSC Testnet": {
        "provider": {
          "rpcTarget": "https://data-seed-prebsc-1-s1.binance.org:8545/",
          "type": "BSC Testnet",
          "chainId": "97",
          "ticker": "BNB",
          "nickname": "Biannce"
        },
        ExplorerUrl: 'https://testnet.bscscan.com',
        ExplorerApiUrl: 'https://api-testnet.bscscan.com',
      }
    }
  },
  [ChainType.Avax]: {
    Name: "Avax",
    MainChainId: '43114',
    UseInfura: false,
    Disabled: false,
    DefiTokenChain: ['avax'],
    CoingeckoId: 'avalanche-2',
    SwapUrl: 'https://traderjoexyz.com/#/trade',
    SwapTokenUrl: 'https://traderjoexyz.com/#/trade?inputCurrency=',
    CurrencyLogo: 'https://cdn.gopocket.finance/files/avax_logo.png',
    NeedAvailableUrl: false,
    OtherCoinInfoUrl: '',
    SushiswapGraphUrl: 'https://api.thegraph.com/subgraphs/name/sushiswap/avalanche-exchange',
    Networks: {
      "Avalanche Mainnet C-Chain": {
        "provider": {
          "rpcTarget": "https://api.avax.network/ext/bc/C/rpc",
          "type": "Avalanche Mainnet C-Chain",
          "chainId": "43114",
          "ticker": "AVAX",
          "nickname": "Avalanche"
        },
        ExplorerUrl: 'https://snowtrace.io',
        ExplorerApiUrl: 'https://api.snowtrace.io',
      },
      "Avalanche FUJI C-Chain": {
        "provider": {
          "rpcTarget": "https://api.avax-test.network/ext/bc/C/rpc",
          "type": "Avalanche FUJI C-Chain",
          "chainId": "43113",
          "ticker": "AVAX",
          "nickname": "Avalanche"
        },
        ExplorerUrl: 'https://testnet.snowtrace.io',
        ExplorerApiUrl: 'https://api-testnet.snowtrace.io',
      }
    }
  },
  [ChainType.Optimism]: {
    Name: "Op",
    MainChainId: '10',
    UseInfura: true,
    Disabled: false,
    DefiTokenChain: ['op'],
    CoingeckoId: 'ethereum',
    SwapUrl: 'https://bafybeicals7ohbyykungbndrzk3qf6pydcbe2w3a3pftwrfbjjirkpxqbq.ipfs.cf-ipfs.com/#/swap',
    SwapTokenUrl: 'https://bafybeicals7ohbyykungbndrzk3qf6pydcbe2w3a3pftwrfbjjirkpxqbq.ipfs.cf-ipfs.com/#/swap?inputCurrency=',
    CurrencyLogo: 'https://cdn.gopocket.finance/files/eth_logo.png',
    NeedAvailableUrl: true,
    OtherCoinInfoUrl: '',
    SushiswapGraphUrl: '',
    Networks: {
      "Optimism Mainnet": {
        "provider": {
          "rpcTarget": "https://mainnet.optimism.io",
          "type": "Optimism Mainnet",
          "chainId": "10",
          "ticker": "ETH",
          "nickname": "Optimism"
        },
        "partnerChainId": "1",
        "infuraType": "optimism-mainnet",
        ExplorerUrl: 'https://optimistic.etherscan.io',
        ExplorerApiUrl: 'https://api-optimistic.etherscan.io',
      },
      "Optimism Testnet Kovan": {
        "provider": {
          "rpcTarget": "https://kovan.optimism.io",
          "type": "Optimism Testnet Kovan",
          "chainId": "69",
          "ticker": "ETH",
          "nickname": "Optimism"
        },
        "partnerChainId": "42",
        "infuraType": "optimism-kovan",
        ExplorerUrl: 'https://kovan-optimistic.etherscan.io',
        ExplorerApiUrl: 'https://api-kovan-optimistic.etherscan.io',
      }
    }
  },
  [ChainType.Syscoin]: {
    Name: "Syscoin",
    MainChainId: '57',
    UseInfura: false,
    Disabled: false,
    DefiTokenChain: ['sys', 'syscoin'],
    CoingeckoId: 'syscoin',
    SwapUrl: 'https://app.pegasys.finance/#/swap',
    SwapTokenUrl: 'https://app.pegasys.finance/#/swap?inputCurrency=',
    CurrencyLogo: 'https://cdn.gopocket.finance/files/syscoin_logo.png',
    NeedAvailableUrl: false,
    OtherCoinInfoUrl: '',
    SushiswapGraphUrl: '',
    Networks: {
      "Syscoin Mainnet": {
        "provider": {
          "rpcTarget": "https://rpc.syscoin.org",
          "type": "Syscoin Mainnet",
          "chainId": "57",
          "ticker": "SYS",
          "nickname": "Syscoin"
        },
        ExplorerUrl: 'https://explorer.syscoin.org',
        ExplorerApiUrl: 'https://explorer.syscoin.org',
      },
      "Syscoin Tanenbaum Testnet": {
        "provider": {
          "rpcTarget": "https://rpc.tanenbaum.io",
          "type": "Syscoin Tanenbaum Testnet",
          "chainId": "5700",
          "ticker": "tSYS",
          "nickname": "Syscoin"
        },
        ExplorerUrl: 'https://tanenbaum.io',
        ExplorerApiUrl: 'https://tanenbaum.io',
      }
    }
  },
  [ChainType.Arbitrum]: {
    Name: "Arb",
    MainChainId: '42161',
    UseInfura: true,
    Disabled: false,
    DefiTokenChain: ['arb'],
    CoingeckoId: 'ethereum',
    SwapUrl: 'https://sushiswap-interface-teamsushi.vercel.app/swap',
    SwapTokenUrl: 'https://sushiswap-interface-teamsushi.vercel.app/swap?inputCurrency=',
    CurrencyLogo: 'https://cdn.gopocket.finance/files/eth_logo.png',
    NeedAvailableUrl: false,
    OtherCoinInfoUrl: '',
    SushiswapGraphUrl: 'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange',
    Networks: {
      "Arbitrum Mainnet": {
        "provider": {
          "rpcTarget": "https://arb1.arbitrum.io/rpc",
          "type": "Arbitrum Mainnet",
          "chainId": "42161",
          "ticker": "ETH",
          "nickname": "Arbitrum"
        },
        ExplorerUrl: 'https://arbiscan.io',
        ExplorerApiUrl: 'https://api.arbiscan.io',
        "confirmIntervalInSecond": 604800,
        "partnerChainId": "1",
        "infuraType": "arbitrum-mainnet",
        "inbox": "0x4Dbd4fc535Ac27206064B68FfCf827b0A60BAB3f",
        "outbox": "0x667e23ABd27E623c11d4CC00ca3EC4d0bD63337a",
        "outbox2": "0x760723CD2e632826c38Fef8CD438A4CC7E7E1A40",
        "l1GatewayRouter": "0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef",
        "arbsys": "0x0000000000000000000000000000000000000064",
        "node_interface": "0x00000000000000000000000000000000000000C8",
        "l2GatewayRouter": "0x5288c571Fd7aD117beA99bF60FE0846C4E84F933",
        "l1ERC20Gateway": "0xa3A7B6F88361F48403514059F1F16C8E78d60EeC",
        "l2ERC20Gateway": "0x09e9222E96E7B4AE2a407B98d48e330053351EEe",
      },
      "Arbitrum Testnet Rinkeby": {
        "provider": {
          "rpcTarget": "https://rinkeby.arbitrum.io/rpc",
          "type": "Arbitrum Testnet Rinkeby",
          "chainId": "421611",
          "ticker": "ETH",
          "nickname": "Arbitrum"
        },
        ExplorerUrl: 'https://testnet.arbiscan.io',
        ExplorerApiUrl: 'https://api-testnet.arbiscan.io',
        "confirmIntervalInSecond": 86400,
        "partnerChainId": "4",
        "infuraType": "arbitrum-rinkeby",
        "inbox": "0x578BAde599406A8fE3d24Fd7f7211c0911F5B29e",
        "outbox": "0xefa1a42D3c4699822eE42677515A64b658be1bFc",
        "outbox2": "0xefa1a42D3c4699822eE42677515A64b658be1bFc",
        "l1GatewayRouter": "0x70C143928eCfFaf9F5b406f7f4fC28Dc43d68380",
        "arbsys": "0x0000000000000000000000000000000000000064",
        "node_interface": "0x00000000000000000000000000000000000000C8",
        "l2GatewayRouter": "0x9413AD42910c1eA60c737dB5f58d1C504498a3cD",
        "l1ERC20Gateway": "0x91169Dbb45e6804743F94609De50D511C437572E",
        "l2ERC20Gateway": "0x195C107F3F75c4C93Eba7d9a1312F19305d6375f"
      }
    }
  },
  [ChainType.Heco]: {
    Name: "Heco",
    MainChainId: '128',
    UseInfura: false,
    Disabled: false,
    DefiTokenChain: ['heco'],
    CoingeckoId: 'huobi-token',
    SwapUrl: 'https://ht.mdex.com/#/swap',
    SwapTokenUrl: 'https://ht.mdex.com/#/swap?inputCurrency=',
    CurrencyLogo: 'https://cdn.gopocket.finance/files/ht_logo.png',
    NeedAvailableUrl: false,
    OtherCoinInfoUrl: '',
    SushiswapGraphUrl: '',
    Networks: {
      "Heco Mainnet": {
        "provider": {
          "rpcTarget": "https://http-mainnet.hecochain.com",
          "type": "Heco Mainnet",
          "chainId": "128",
          "ticker": "HT",
          "nickname": "HuoBi"
        },
        rpcTargets: [
          'https://http-mainnet-node.huobichain.com',
          'https://http-mainnet.hecochain.com',
        ],
        ExplorerUrl: 'https://hecoinfo.com',
        ExplorerApiUrl: 'https://api.hecoinfo.com',
      },
      "Heco Testnet": {
        "provider": {
          "rpcTarget": "https://http-testnet.hecochain.com",
          "type": "Heco Testnet",
          "chainId": "256",
          "ticker": "HT",
          "nickname": "HuoBi"
        },
        ExplorerUrl: 'https://testnet.hecoinfo.com',
        ExplorerApiUrl: 'https://api-testnet.hecoinfo.com',
      }
    }
  },
  [ChainType.Tron]: {
    Name: "Tron",
    MainChainId: '123454321',
    UseInfura: false,
    Disabled: true,
    DefiTokenChain: ['tron'],
    SwapUrl: '',
    SwapTokenUrl: '',
    CurrencyLogo: '',
    NeedAvailableUrl: false,
    OtherCoinInfoUrl: '',
    SushiswapGraphUrl: '',
    Networks: {
      "TRON Mainnet": {
        "provider": {
          "rpcTarget": "https://api.trongrid.io",
          "type": "TRON Mainnet",
          "chainId": "123454321",
          "ticker": "TRX",
          "nickname": "TronGrid"
        },
        "apiKey": "189ef738-d538-4007-afa7-6b14f020b921",
        ExplorerUrl: 'https://tronscan.org/#',
        ExplorerApiUrl: '',
      },
      "TRON Shasta Testnet": {
        "provider": {
          "rpcTarget": "https://api.shasta.trongrid.io",
          "type": "TRON Shasta Testnet",
          "chainId": "123454322",
          "ticker": "TRX",
          "nickname": "TronGrid"
        },
        ExplorerUrl: '',
        ExplorerApiUrl: '',
      }
    }
  }
};

/**
 * support nft list
 */
export const SupportCollectibles = [ChainType.Ethereum, ChainType.Polygon, ChainType.Bsc, ChainType.Avax];

export const OnEventTag = {
  [ChainType.Ethereum]: {
    EventValueName: 'eth',
    EventActiveUsers: 'EthActiveUsers',
  },
  [ChainType.Arbitrum]: {
    EventValueName: 'arb',
    EventActiveUsers: 'ArbActiveUsers',
  },
  [ChainType.Polygon]: {
    EventValueName: 'polygon',
    EventActiveUsers: 'PolygonActiveUsers',
  },
  [ChainType.Bsc]: {
    EventValueName: 'bsc',
    EventActiveUsers: 'BscActiveUsers',
  },
  [ChainType.Heco]: {
    EventValueName: 'heco',
    EventActiveUsers: 'HecoActiveUsers',
  },
  [ChainType.Avax]: {
    EventValueName: 'avax',
    EventActiveUsers: 'AvalancheActiveUsers',
  },
  [ChainType.Optimism]: {
    EventValueName: 'op',
    EventActiveUsers: 'OpActiveUsers',
  },
  [ChainType.Syscoin]: {
    EventValueName: 'syscoin',
    EventActiveUsers: 'SyscoinActiveUsers',
  }
}

export const BaseChainConfig = {
  "1": {
    "balances_address": "0xb1f8e55c7f64d203c1400b9d8555d050f94adf39",
    "coingecko_path": "ethereum",
    "tokeninfos_address": "0x4c4CE947f2cFb993B0ADdEB7373450bf2F4f54Fe",
    "nftbalances_address": "0x557cF37ABEA8b81fA7fbB02a5f1907fDdFE96cA3"
  },
  "42": {
    "balances_address": "0x55ABBa8d669D60A10c104CC493ec5ef389EC92bb",
    "tokeninfos_address": "0xb5594691309F221938acd51E49c0f7dCbE706E0E"
  },
  "144545313136048": {
    "balances_address": "0x4E559f2f05B8C5F8D6749850770Fa48619FC49b5"
  },
  "97": {
    "balances_address": "0x2352c63A83f9Fd126af8676146721Fa00924d7e4",
    "tokeninfos_address": "0xFF54Af62869C88665D60b721d224ea710773D43d",
    "nftbalances_address": "0x818d59f18F7055125d66818F0a570c83A2328670"
  },
  "56": {
    "balances_address": "0x2352c63A83f9Fd126af8676146721Fa00924d7e4",
    "coingecko_path": "binance-smart-chain",
    "tokeninfos_address": "0x4318ae67f4102f19786eBaa5ef11675dB58cC38d",
    "nftbalances_address": "0x1a3F725ed4A94A193E6f4401A9a4197331f6D117"
  },
  "80001": {
    "balances_address": "0x2352c63A83f9Fd126af8676146721Fa00924d7e4",
    "tokeninfos_address": "0xa5dBF8bbaB9CEbab8716eC6e6538C94600FA039C",
    "nftbalances_address": "0xD599EAB2D07C60889b70B69a3bC76dca39f2d9eC"
  },
  "137": {
    "balances_address": "0x2352c63A83f9Fd126af8676146721Fa00924d7e4",
    "coingecko_path": "polygon-pos",
    "tokeninfos_address": "0xfe73731e5CbBaA28C43740A2953BB4Dc343dddDa",
    "nftbalances_address": "0x65067414772F3153476E23C8394055838b48798A"
  },
  "4": {
    "balances_address": "0x5C5862640F08727B644bf685C1fB26e48b2D2D0a",
    "nftbalances_address": "0x8d1516E8ECFd12911391474346C64E1967C39B03"
  },
  "5": {
    "balances_address": "0x4E559f2f05B8C5F8D6749850770Fa48619FC49b5"
  },
  "421611": {
    "balances_address": "0x2352c63A83f9Fd126af8676146721Fa00924d7e4",
    "tokeninfos_address": "0xB2320Fc8ACFE40Ee0B37ADc514074EcDE7eb86e4",
    "nftbalances_address": "0x6A447b3AbF4Cb2Bd93F8259DE2621b38beEf3f19"
  },
  "42161": {
    "balances_address": "0xBFD340EB52D77ADeDA7622367877072E72E5bfDb",
    "coingecko_path": "arbitrum-one",
    "tokeninfos_address": "0xE45488a0317CD174485f8e9ec689F23d2dC8E4f5",
    "nftbalances_address": "0x6A447b3AbF4Cb2Bd93F8259DE2621b38beEf3f19"
  },
  "128": {
    "balances_address": "0x667AD1C77181FA247a1220d9a95b054802e52777",
    "coingecko_path": "huobi-token",
    "tokeninfos_address": "0xBFD340EB52D77ADeDA7622367877072E72E5bfDb",
    "nftbalances_address": "0x62aa5e356A8C7764141174368e54e9aDfE5535FC"
  },
  "256": {
    "balances_address": "0x667AD1C77181FA247a1220d9a95b054802e52777",
    "tokeninfos_address": "0xBFD340EB52D77ADeDA7622367877072E72E5bfDb",
    "nftbalances_address": "0x2352c63A83f9Fd126af8676146721Fa00924d7e4"
  },
  "123454321": {
    "balances_address": "TUSbrg4t9X4nGZcJWntuzGfp7FSTTexWh5",
    "tokeninfos_address": "TQKaNLbzBn4W769A3YJjYT3RMfHKVFLG8s",
    "nftbalances_address": "TJ5eCo6ZrH9yxd2sU9fZaJiP2DbvpxViQb"
  },
  "123454322": {
    "balances_address": "THbRgYoAdPUYoPEqHvKfkKZA1waK6HQUer",
    "tokeninfos_address": "TM9iiCpdrNKg4pqCoSL4GKVE1dTfNckyeT",
    "nftbalances_address": "TF2zjuDoUmb6mZaXNoVbzee5M9ikukDXMi"
  },
  "69": {
  },
  "10": {
    "coingecko_path": "optimistic-ethereum"
  },
  "43114": {
    "coingecko_path": "avalanche",
    "balances_address": "0xBFD340EB52D77ADeDA7622367877072E72E5bfDb",
    "tokeninfos_address": "0x4a5eE16E6885C7C351d02A6034c49061EA07AFE7",
    "nftbalances_address": "0xfE9d246Ec73c164d77c5660f8811d4CeA82aE12c"
  },
  "43113": {
    "balances_address": "0xBFD340EB52D77ADeDA7622367877072E72E5bfDb",
    "tokeninfos_address": "0x4a5eE16E6885C7C351d02A6034c49061EA07AFE7",
    "nftbalances_address": "0x667AD1C77181FA247a1220d9a95b054802e52777"
  },
  "57": {
    "coingecko_path": "syscoin",
    "balances_address": "0xBFD340EB52D77ADeDA7622367877072E72E5bfDb",
    "tokeninfos_address": "0x4a5eE16E6885C7C351d02A6034c49061EA07AFE7",
    "nftbalances_address": "0x667AD1C77181FA247a1220d9a95b054802e52777"
  },
  "5700": {
    "balances_address": "0xBFD340EB52D77ADeDA7622367877072E72E5bfDb",
    "tokeninfos_address": "0x4a5eE16E6885C7C351d02A6034c49061EA07AFE7",
    "nftbalances_address": "0x667AD1C77181FA247a1220d9a95b054802e52777"
  }
};
