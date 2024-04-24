import { ChainType, util } from 'paliwallet-core';
import { strings } from '../../locales/i18n';
import { RPC } from './networks';
import { getIcTagResource, getTagColor, getIcLogoResource } from './rpcUtil';
import { getRpcNickname } from './ControllerUtils';

export const ChainTypes = [
	ChainType.All,
	ChainType.Ethereum,
	ChainType.Polygon,
	ChainType.Arbitrum,
	ChainType.Bsc,
	ChainType.Heco,
	ChainType.Optimism,
	ChainType.Avax,
	ChainType.Syscoin,
	ChainType.Rollux,
	ChainType.Base,
	ChainType.Blast,
	ChainType.Fantom,
	ChainType.Mantle,
	ChainType.Aurora,
	// ChainType.Linea,
	// ChainType.Manta,
	// ChainType.Gnosis,
	// ChainType.Celo,
	// ChainType.Era,
	// ChainType.Mode,
	// ChainType.Metis,
	// ChainType.Scroll,
	// ChainType.PolygonZkEVM,
	ChainType.RPCBase
];
export const ChainTypeNames = [
	strings('wallet.all_network'),
	strings('wallet.eth_etwork'),
	strings('wallet.polygon_network'),
	strings('wallet.arbitrum_network'),
	strings('wallet.bsc_network'),
	strings('wallet.heco_network'),
	strings('wallet.optimism_network'),
	strings('wallet.avalanche_network'),
	strings('wallet.syscoin_network'),
	strings('wallet.rollux_network'),
	strings('wallet.base_network'),
	strings('wallet.blast_network'),
	strings('wallet.fantom_network'),
	strings('wallet.mantle_network'),
	strings('wallet.aurora_network'),
	RPC
];
export const ChainTypeIcons = [
	require('../images/ic_card_all.png'),
	require('../images/ic_card_eth.png'),
	require('../images/ic_card_polygon.png'),
	require('../images/ic_card_arb.png'),
	require('../images/ic_card_bsc.png'),
	require('../images/ic_card_heco.png'),
	require('../images/ic_card_op.png'),
	require('../images/ic_card_avax.png'),
	require('../images/ic_card_syscoin.png'),
	require('../images/ic_card_rollux.png'),
	require('../images/ic_card_base.png'),
	require('../images/ic_card_blast.png'),
	require('../images/ic_card_fantom.png'),
	require('../images/ic_card_mantle.png'),
	require('../images/ic_card_aurora.png'),
	require('../images/ic_card_other.png')
];
export const ChainTypeMoreIcons = [
	require('../images/ic_card_more_eth.png'), //随意加一个，不使用
	require('../images/ic_card_more_eth.png'),
	require('../images/ic_card_more_polygon.png'),
	require('../images/ic_card_more_arb.png'),
	require('../images/ic_card_more_bsc.png'),
	require('../images/ic_card_more_heco.png'),
	require('../images/ic_card_more_op.png'),
	require('../images/ic_card_more_avax.png'),
	require('../images/ic_card_more_syscoin.png'),
	require('../images/ic_card_more_rollux.png'),
	require('../images/ic_card_more_base.png'),
	require('../images/ic_card_more_blast.png'),
	require('../images/ic_card_more_fantom.png'),
	require('../images/ic_card_more_mantle.png'),
	require('../images/ic_card_more_aurora.png'),
	require('../images/ic_card_more_other.png')
];
export const ChainTypeBg = [
	require('../images/pali-bg.png'),
	require('../images/ethereum-bg.png'),
	require('../images/polygon-bg.png'),
	require('../images/arbitrum-bg.png'),
	require('../images/bnb-bg.png'),
	require('../images/heco-bg.png'),
	require('../images/optmism-bg.png'),
	require('../images/avalanche-bg.png'),
	require('../images/syscoin-bg.png'),
	require('../images/rollux-bg.png'),
	require('../images/base-bg.png'),
	require('../images/blast-bg.png'),
	require('../images/fantom-bg.png'),
	require('../images/mantle-bg.png'),
	require('../images/aurora-bg.png'),

	require('../images/pali-bg.png')
];

export const ChainTypeBgWithoutShadows = [
	require('../images/pali-bg.png'),
	require('../images/ethereum-bg.png'),
	require('../images/polygon-bg.png'),
	require('../images/arbitrum-bg.png'),
	require('../images/bnb-bg.png'),
	require('../images/pali-bg.png'),
	require('../images/pali-bg.png'),
	require('../images/avalanche-bg.png'),
	require('../images/syscoin-bg.png'),
	require('../images/rollux-bg.png'),
	require('../images/base-bg.png'),
	require('../images/blast-bg.png'),
	require('../images/fantom-bg.png'),
	require('../images/mantle-bg.png'),
	require('../images/aurora-bg.png'),

	require('../images/pali-bg.png')
];
export const ChainTypeCheckColorStyle = [
	{ color: '#DBAAF5' },
	{ color: '#FAC6B7' },
	{ color: '#703CD3' },
	{ color: '#24516B' },
	{ color: '#DFBB00' },
	{ color: '#17A878' },
	{ color: '#A5212F' },
	{ color: '#2D374F' },
	{ color: '#030363' },
	{ color: '#9D7DF8' }
];
export const ChainTypeBgOngoing = [
	require('../images/img_ongoing_eth.png'),
	require('../images/img_ongoing_eth.png'),
	require('../images/img_ongoing_polygon.png'),
	require('../images/img_ongoing_arb.png'),
	require('../images/img_ongoing_bsc.png'),
	require('../images/img_ongoing_heco.png'),
	require('../images/img_ongoing_op.png'),
	require('../images/img_ongoing_avax.png'),
	require('../images/img_ongoing_syscoin.png'),
	require('../images/img_ongoing_rollux.png'),
	require('../images/img_ongoing_base.png'),
	require('../images/img_ongoing_blast.png'),
	require('../images/img_ongoing_fantom.png'),
	require('../images/img_ongoing_mantle.png'),
	require('../images/img_ongoing_aurora.png'),

	require('../images/img_ongoing_other.png')
];
export const ChainTypeBgDefi = [
	require('../images/ic_defi_eth.png'),
	require('../images/ic_defi_eth.png'),
	require('../images/ic_defi_polygon.png'),
	require('../images/ic_defi_arb.png'),
	require('../images/ic_defi_bsc.png'),
	require('../images/ic_defi_heco.png'),
	require('../images/ic_defi_op.png'),
	require('../images/ic_defi_avax.png'),
	require('../images/ic_defi_syscoin.png'),
	require('../images/ic_defi_rollux.png'),
	require('../images/ic_defi_base.png'),
	require('../images/ic_defi_blast.png'),
	require('../images/ic_defi_fantom.png'),
	require('../images/ic_defi_mantle.png'),
	require('../images/ic_defi_aurora.png'),

	require('../images/letter/ic_defi_other.png')
];
export function getAssetNetworkBarColor(type) {
	return type === ChainType.Bsc
		? '#FEBF27'
		: type === ChainType.Polygon
		? '#8247E5'
		: type === ChainType.Arbitrum
		? '#23A1F0'
		: type === ChainType.Heco
		? '#47A150'
		: type === ChainType.Optimism
		? '#FF0420'
		: type === ChainType.Avax
		? '#e84341'
		: type === ChainType.Syscoin
		? '#1F5EFF'
		: type === ChainType.Rollux
		? '#DBEF88'
		: type === ChainType.Base
		? '#0229FF'
		: type === ChainType.Blast
		? '#FCFC03'
		: type === ChainType.Fantom
		? '#1969FF'
		: type === ChainType.Mantle
		? '#31D1AC'
		: type === ChainType.Aurora
		? '#78D64B'
		: util.isRpcChainType(type)
		? getTagColor(type)
		: '#627EEA';
}
export function getShareImage(type) {
	if (type === ChainType.Polygon) {
		return require('../images/ic_share_polygon.png');
	} else if (type === ChainType.Bsc) {
		return require('../images/ic_share_bsc.png');
	} else if (type === ChainType.Arbitrum) {
		return require('../images/ic_share_arb.png');
	} else if (type === ChainType.Heco) {
		return require('../images/ic_share_heco.png');
	} else if (type === ChainType.Optimism) {
		return require('../images/ic_share_op.png');
	} else if (type === ChainType.Avax) {
		return require('../images/ic_share_avax.png');
	} else if (type === ChainType.Syscoin) {
		return require('../images/ic_share_syscoin.png');
	} else if (type === ChainType.Rollux) {
		return require('../images/ic_share_rollux.png');
	} else if (type === ChainType.Base) {
		return require('../images/ic_share_base.png');
	} else if (type === ChainType.Blast) {
		return require('../images/ic_share_blast.png');
	} else if (type === ChainType.Fantom) {
		return require('../images/ic_share_fantom.png');
	} else if (type === ChainType.Mantle) {
		return require('../images/ic_share_mantle.png');
	} else if (type === ChainType.Aurora) {
		return require('../images/ic_share_aurora.png');
	}

	return require('../images/ic_share_eth.png');
}

export function getIcLogoByChainType(type) {
	return type === ChainType.Bsc
		? require('../images/ic_logo_bsc.png')
		: type === ChainType.Polygon
		? require('../images/ic_logo_polygon.png')
		: type === ChainType.Arbitrum
		? require('../images/ic_logo_arb.png')
		: type === ChainType.Heco
		? require('../images/ic_logo_heco.png')
		: type === ChainType.Optimism
		? require('../images/ic_logo_op.png')
		: type === ChainType.Avax
		? require('../images/ic_logo_avax.png')
		: type === ChainType.Syscoin
		? require('../images/ic_logo_syscoin.png')
		: type === ChainType.Rollux
		? require('../images/ic_logo_rollux.png')
		: type === ChainType.Base
		? require('../images/ic_logo_base.png')
		: type === ChainType.Blast
		? require('../images/ic_logo_blast.png')
		: type === ChainType.Fantom
		? require('../images/ic_logo_fantom.png')
		: type === ChainType.Mantle
		? require('../images/ic_logo_mantle.png')
		: type === ChainType.Aurora
		? require('../images/ic_logo_aurora.png')
		: util.isRpcChainType(type)
		? getIcLogoResource(type)
		: require('../images/ic_logo_eth.png');
}

export function getIcCardByChainType(type) {
	return type === ChainType.Bsc
		? require('../images/ic_card_bsc.png')
		: type === ChainType.Polygon
		? require('../images/ic_card_polygon.png')
		: type === ChainType.Arbitrum
		? require('../images/ic_card_arb.png')
		: type === ChainType.Heco
		? require('../images/ic_card_heco.png')
		: type === ChainType.Optimism
		? require('../images/ic_card_op.png')
		: type === ChainType.Avax
		? require('../images/ic_card_avax.png')
		: type === ChainType.Syscoin
		? require('../images/ic_card_syscoin.png')
		: type === ChainType.Rollux
		? require('../images/ic_card_rollux.png')
		: type === ChainType.Base
		? require('../images/ic_card_base.png')
		: type === ChainType.Blast
		? require('../images/ic_card_blast.png')
		: type === ChainType.Fantom
		? require('../images/ic_card_fantom.png')
		: type === ChainType.Mantle
		? require('../images/ic_card_mantle.png')
		: type === ChainType.Aurora
		? require('../images/ic_card_aurora.png')
		: util.isRpcChainType(type)
		? getIcTagResource(type)
		: require('../images/ic_card_eth.png');
}

export function getIcTagByChainType(type) {
	return type === ChainType.Bsc
		? require('../images/ic_bsc_tag.png')
		: type === ChainType.Polygon
		? require('../images/ic_polygon_tag.png')
		: type === ChainType.Arbitrum
		? require('../images/ic_arb_tag.png')
		: type === ChainType.Heco
		? require('../images/ic_heco_tag.png')
		: type === ChainType.Optimism
		? require('../images/ic_op_tag.png')
		: type === ChainType.Avax
		? require('../images/ic_avax_tag.png')
		: type === ChainType.Syscoin
		? require('../images/ic_syscoin_tag.png')
		: type === ChainType.Rollux
		? require('../images/ic_rollux_tag.png')
		: type === ChainType.Base
		? require('../images/ic_base_tag.png')
		: type === ChainType.Blast
		? require('../images/ic_blast_tag.png')
		: type === ChainType.Fantom
		? require('../images/ic_fantom_tag.png')
		: type === ChainType.Mantle
		? require('../images/ic_mantle_tag.png')
		: type === ChainType.Aurora
		? require('../images/ic_aurora_tag.png')
		: util.isRpcChainType(type)
		? getIcTagResource(type)
		: require('../images/ic_eth_tag.png');
}
export function getTabIcon(type) {
	if (type === ChainType.Polygon) {
		return require('../images/ic_tab_polygon.png');
	} else if (type === ChainType.Bsc) {
		return require('../images/ic_tab_bsc.png');
	} else if (type === ChainType.Arbitrum) {
		return require('../images/ic_tab_arb.png');
	} else if (type === ChainType.Heco) {
		return require('../images/ic_tab_heco.png');
	} else if (type === ChainType.Optimism) {
		return require('../images/ic_tab_op.png');
	} else if (type === ChainType.Avax) {
		return require('../images/ic_tab_avax.png');
	} else if (type === ChainType.Syscoin) {
		return require('../images/ic_tab_syscoin.png');
	} else if (type === ChainType.Rollux) {
		return require('../images/ic_tab_rollux.png');
	}

	return require('../images/ic_tab_eth.png');
}

export const getChainTypeName = type => {
	if (type === ChainType.Bsc) {
		return strings('other.bsc');
	} else if (type === ChainType.Polygon) {
		return strings('other.polygon');
	} else if (type === ChainType.Arbitrum) {
		return strings('other.arbitrum');
	} else if (type === ChainType.Tron) {
		return strings('other.tron');
	} else if (type === ChainType.Heco) {
		return strings('other.heco');
	} else if (type === ChainType.Optimism) {
		return strings('other.optimism');
	} else if (type === ChainType.Avax) {
		return strings('other.avalanche');
	} else if (type === ChainType.Syscoin) {
		return strings('other.syscoin');
	} else if (type === ChainType.Rollux) {
		return strings('other.rollux');
	} else if (type === ChainType.Base) {
		return strings('other.base');
	} else if (type === ChainType.Blast) {
		return strings('other.blast');
	} else if (type === ChainType.Fantom) {
		return strings('other.fantom');
	} else if (type === ChainType.Mantle) {
		return strings('other.mantle');
	} else if (type === ChainType.Aurora) {
		return strings('other.aurora');
	}

	// else if (type === ChainType.Linea) {
	// 	return strings('other.linea');
	// } else if (type === ChainType.Manta) {
	// 	return strings('other.manta');
	// } else if (type === ChainType.Gnosis) {
	// 	return strings('other.gnosis');
	// }
	// else if (type === ChainType.Celo) {
	// 	return strings('other.celo');
	// } else if (type === ChainType.ZkSync) {
	// 	return strings('other.zksync');
	// } else if (type === ChainType.Era) {
	// 	return strings('other.era');
	// } else if (type === ChainType.Mode) {
	// 	return strings('other.mode');
	// } else if (type === ChainType.Metis) {
	// 	return strings('other.metis');
	// } else if (type === ChainType.Scroll) {
	// 	return strings('other.scroll');
	// } else if (type === ChainType.PolygonZkEVM) {
	// 	return strings('other.polygon_zkevm');
	// }
	else if (util.isRpcChainType(type)) {
		return getRpcNickname(type) || RPC;
	}
	return strings('other.ethereum');
};

export const getDeveloperTitle = type => {
	if (type === ChainType.Bsc) {
		return strings('developer_options.bsc_network');
	} else if (type === ChainType.Polygon) {
		return strings('developer_options.polygon_network');
	} else if (type === ChainType.Arbitrum) {
		return strings('developer_options.arbitrum_network');
	} else if (type === ChainType.Tron) {
		return strings('developer_options.tron_network');
	} else if (type === ChainType.Heco) {
		return strings('developer_options.heco_network');
	} else if (type === ChainType.Optimism) {
		return strings('developer_options.optimism_network');
	} else if (type === ChainType.Avax) {
		return strings('developer_options.avax_network');
	} else if (type === ChainType.Syscoin) {
		return strings('developer_options.syscoin_network');
	} else if (type === ChainType.Rollux) {
		return strings('developer_options.rollux_network');
	} else if (type === ChainType.Base) {
		return strings('developer_options.base_network');
	} else if (type === ChainType.Blast) {
		return strings('developer_options.blast_network');
	} else if (type === ChainType.Fantom) {
		return strings('developer_options.fantom_network');
	} else if (type === ChainType.Mantle) {
		return strings('developer_options.mantle_network');
	} else if (type === ChainType.Aurora) {
		return strings('developer_options.aurora_network');
	}
	// else if (type === ChainType.Linea) {
	// 	return strings('developer_options.linea_network');
	// } else if (type === ChainType.Manta) {
	// 	return strings('developer_options.manta_network');
	// } else if (type === ChainType.Gnosis) {
	// 	return strings('developer_options.gnosis_network');
	// }
	// else if (type === ChainType.Celo) {
	// 	return strings('developer_options.celo_network');
	// } else if (type === ChainType.ZkSync) {
	// 	return strings('developer_options.zksync_network');
	// } else if (type === ChainType.Era) {
	// 	return strings('developer_options.era_network');
	// } else if (type === ChainType.Mode) {
	// 	return strings('developer_options.mode_network');
	// } else if (type === ChainType.Metis) {
	// 	return strings('developer_options.metis_network');
	// } else if (type === ChainType.Scroll) {
	// 	return strings('developer_options.scroll_network');
	// } else if (type === ChainType.PolygonZkEVM) {
	// 	return strings('developer_options.polygon_zkevm_network');
	// }
	return strings('developer_options.ethereum_network');
};

export const ChainTypeSettingsItems = [
	{
		text: strings('wallet.eth_etwork'),
		icon: require('../images/img_asset_eth.png'),
		chainType: ChainType.Ethereum
	},
	{
		text: strings('wallet.polygon_network'),
		icon: require('../images/img_asset_polygon.png'),
		chainType: ChainType.Polygon
	},
	{
		text: strings('wallet.arbitrum_network'),
		icon: require('../images/img_asset_arb.png'),
		chainType: ChainType.Arbitrum
	},
	{
		text: strings('wallet.bsc_network'),
		icon: require('../images/img_asset_bsc.png'),
		chainType: ChainType.Bsc
	},
	{
		text: strings('wallet.heco_network'),
		icon: require('../images/img_asset_heco.png'),
		chainType: ChainType.Heco
	},
	{
		text: strings('wallet.optimism_network'),
		icon: require('../images/img_asset_op.png'),
		chainType: ChainType.Optimism
	},
	{
		text: strings('wallet.avalanche_network'),
		icon: require('../images/img_asset_avax.png'),
		chainType: ChainType.Avax
	},
	{
		text: strings('wallet.syscoin_network'),
		icon: require('../images/img_asset_syscoin.png'),
		chainType: ChainType.Syscoin
	},
	{
		text: strings('wallet.rollux_network'),
		icon: require('../images/img_asset_rollux.png'),
		chainType: ChainType.Rollux
	},
	{
		text: strings('wallet.base_network'),
		icon: require('../images/img_asset_base.png'),
		chainType: ChainType.Base
	},
	{
		text: strings('wallet.blast_network'),
		icon: require('../images/img_asset_blast.png'),
		chainType: ChainType.Blast
	},
	{
		text: strings('wallet.fantom_network'),
		icon: require('../images/img_asset_fantom.png'),
		chainType: ChainType.Fantom
	},
	{
		text: strings('wallet.mantle_network'),
		icon: require('../images/img_asset_mantle.png'),
		chainType: ChainType.Mantle
	},
	{
		text: strings('wallet.aurora_network'),
		icon: require('../images/img_asset_aurora.png'),
		chainType: ChainType.Aurora
	}

	// {
	// 	text: strings('wallet.linea_network'),
	// 	icon: require('../images/img_asset_linea.png'),
	// 	chainType: ChainType.Linea
	// },
	// {
	// 	text: strings('wallet.manta_network'),
	// 	icon: require('../images/img_asset_manta.png'),
	// 	chainType: ChainType.Manta
	// },
	// {
	// 	text: strings('wallet.gnosis_network'),
	// 	icon: require('../images/img_asset_gnosis.png'),
	// 	chainType: ChainType.Gnosis
	// },

	// {
	// 	text: strings('wallet.celo_network'),
	// 	icon: require('../images/img_asset_celo.png'),
	// 	chainType: ChainType.Celo
	// },
	// {
	// 	text: strings('wallet.zksync_network'),
	// 	icon: require('../images/img_asset_zksync.png'),
	// 	chainType: ChainType.ZkSync
	// },
	// {
	// 	text: strings('wallet.era_network'),
	// 	icon: require('../images/img_asset_era.png'),
	// 	chainType: ChainType.Era
	// },
	// {
	// 	text: strings('wallet.mode_network'),
	// 	icon: require('../images/img_asset_mode.png'),
	// 	chainType: ChainType.Mode
	// },
	// {
	// 	text: strings('wallet.metis_network'),
	// 	icon: require('../images/img_asset_metis.png'),
	// 	chainType: ChainType.Metis
	// },
	// {
	// 	text: strings('wallet.scroll_network'),
	// 	icon: require('../images/img_asset_scroll.png'),
	// 	chainType: ChainType.Scroll
	// },
	// {
	// 	text: strings('wallet.polygon_zkevm_network'),
	// 	icon: require('../images/img_asset_polygon_zkevm.png'),
	// 	chainType: ChainType.PolygonZkEVM
	// }
];

export const chainToChainType = chain => {
	if (chain === 1) {
		return ChainType.Ethereum;
	}
	if (chain === 2) {
		return ChainType.Bsc;
	}
	if (chain === 3) {
		return ChainType.Polygon;
	}
	if (chain === 4) {
		return ChainType.Arbitrum;
	}
	if (chain === 6) {
		return ChainType.Heco;
	}
	if (chain === 7) {
		return ChainType.Optimism;
	}
	if (chain === 8) {
		return ChainType.Avax;
	}
	if (chain === 9) {
		return ChainType.Syscoin;
	}
	if (chain === 10) {
		return ChainType.Rollux;
	}
	if (chain === 11) {
		return ChainType.Base;
	}
	if (chain === 12) {
		return ChainType.Blast;
	}
	if (chain === 13) {
		return ChainType.Fantom;
	}
	if (chain === 14) {
		return ChainType.Mantle;
	}
	if (chain === 15) {
		return ChainType.Aurora;
	}

	return chain;
};

export const chainTypeTochain = chainType => {
	if (chainType === ChainType.Ethereum) {
		return 1;
	}
	if (chainType === ChainType.Bsc) {
		return 2;
	}
	if (chainType === ChainType.Polygon) {
		return 3;
	}
	if (chainType === ChainType.Arbitrum) {
		return 4;
	}
	if (chainType === ChainType.Heco) {
		return 6;
	}
	if (chainType === ChainType.Optimism) {
		return 7;
	}
	if (chainType === ChainType.Avax) {
		return 8;
	}
	if (chainType === ChainType.Syscoin) {
		return 9;
	}
	if (chainType === ChainType.Rollux) {
		return 10;
	}
	if (chainType === ChainType.Base) {
		return 11;
	}
	if (chainType === ChainType.Blast) {
		return 12;
	}
	if (chainType === ChainType.Fantom) {
		return 13;
	}
	if (chainType === ChainType.Mantle) {
		return 14;
	}
	if (chainType === ChainType.Aurora) {
		return 15;
	}

	return chainType;
};
