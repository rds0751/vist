import React, { useMemo } from 'react';

import AccountSettings from '../../../images/svg/account_settings.svg';
import Broom from '../../../images/svg/broom.svg';
import Coin from '../../../images/svg/coin.svg';
import Edit from '../../../images/svg/edit.svg';
import Globe from '../../../images/svg/globe.svg';
import NFT from '../../../images/svg/nft.svg';
import Settings from '../../../images/svg/settings.svg';
import Shield from '../../../images/svg/shield.svg';
import Trash from '../../../images/svg/trash.svg';
import Visibility from '../../../images/svg/visibility.svg';
import VisibilityOff from '../../../images/svg/visibilityOff.svg';
import Wallet from '../../../images/svg/wallet.svg';
import CoinGecko from '../../../images/svg/coingecko-logo.svg';
import P2P from '../../../images/svg/p2p.svg';
import Vista from '../../../images/svg/vista.svg';

const icons = {
	accountSettings: AccountSettings,
	broom: Broom,
	coin: Coin,
	edit: Edit,
	globe: Globe,
	nft: NFT,
	settings: Settings,
	shield: Shield,
	trash: Trash,
	visibility: Visibility,
	visibilityOff: VisibilityOff,
	wallet: Wallet,
	coinGecko: CoinGecko,
	vista: Vista,
	p2p: P2P
};

const Icon = _props => {
	const SelectedIcon = useMemo(() => icons[_props.name], [_props.name]);
	return <SelectedIcon {..._props} />;
};

export default Icon;
