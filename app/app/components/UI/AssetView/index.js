import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { WebView } from 'react-native-webview';
import I18n from 'react-native-i18n';
import { scrollTo } from 'react-native-reanimated';

import {
	StyleSheet,
	View,
	TouchableOpacity,
	Image,
	Text,
	processColor,
	TouchableWithoutFeedback,
	NativeModules,
	Platform,
	ActivityIndicator,
	ScrollView
} from 'react-native';
import Modal from 'react-native-modal';
import { CandleStickChart } from 'react-native-charts-wrapper';
import Clipboard from '@react-native-community/clipboard';
import HTMLView from 'react-native-htmlview';
import { now } from 'lodash';

import TokenImage from '../TokenImage';
import Locked from '../Locked';
import ApprovalEvent from '../ApprovalEvent';
import ImageCapInset from '../ImageCapInset';
import Approve from '../../Views/ApproveView/Approve';
import Icon from '../Icon';

import { baseStyles, colors, fontStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import Device from '../../../util/Device';
import syscoinIntro from '../../../util/syscoinIntro.js';
import rolluxIntro from '../../../util/rolluxIntro';
import Engine from '../../../core/Engine';
import EntryScriptWeb3 from '../../../core/EntryScriptWeb3';
import { ChainType, util } from 'paliwallet-core';
import { getQueryId } from '../../../data/ContractData';
import { store } from '../../../store';
import { toggleApproveModalInModal } from '../../../actions/modals';
import { ThemeContext } from '../../../theme/ThemeProvider';
import { toggleShowHint } from '../../../actions/hint';

import {
	convertUsdValue,
	getChainIdByType,
	onlyAddCurrencySymbol,
	renderCoinValue,
	appendTickerSuffix,
	extractTicker
} from '../../../util/number';

import ic_liquidity from '../../../images/ic_coin_liquidity.png';
import ic_volume from '../../../images/ic_coin_volume.png';
import ic_ath from '../../../images/ic_coin_high.png';
import ic_market_cap from '../../../images/ic_coin_market.png';
import ic_mc_rank from '../../../images/ic_coin_rank.png';
import ic_total_supply from '../../../images/ic_coin_total.png';
import ic_circulation from '../../../images/ic_coin_circulation.png';
import ic_fdv from '../../../images/ic_coin_fdv.png';
//const chart = createChart(document.getElementById("chart1"));

const styles = StyleSheet.create({
	wrapper: {
		position: 'relative',
		flex: 1,
		paddingBottom: 100
	},
	iconStyle: {
		alignItems: 'center',
		width: 50,
		height: 50,

		borderRadius: 10
	},
	iconAssetStyle: {
		width: 20,
		height: 20
	},
	headerMargin: {
		marginTop: -6
	},
	bodyMargin: {
		marginTop: -14
	},
	otherBody: {
		marginVertical: 30,
		marginHorizontal: 20
	},
	cardWrapper: {
		flex: 1,
		marginHorizontal: -2
	},
	chartLayout: {
		flex: 1,
		padding: 20
	},
	chart: {
		flex: 1,
		height: 450,
		borderRadius: 10,
		marginBottom: 5,
		marginTop: 5
	},
	chartTrading: {
		color: colors.$030319,
		...fontStyles.bold,
		fontSize: 20
	},
	modalNoBorder: {
		justifyContent: 'flex-end'
	},
	timeArrayLayout: {
		flexDirection: 'row',
		marginLeft: 36,
		marginTop: Device.isAndroid() ? -12 : -8
	},
	timeArrayLabel: {
		flex: 1,
		color: colors.$74788D,
		fontSize: 9
	},
	modalContainer: {
		alignSelf: 'center',
		backgroundColor: colors.white,
		borderRadius: 10,
		flexDirection: 'row',
		paddingVertical: 27,
		paddingHorizontal: 30,
		width: '80%'
	},
	approvalTitle: {
		marginLeft: 20,
		marginTop: 20,
		color: colors.$030319,
		...fontStyles.bold,
		fontSize: 20,
		marginVertical: 10
	},
	approvalHint: {
		margin: 20,
		marginTop: 4,
		fontSize: 11,
		color: colors.$60657D,
		lineHeight: 18,
		...fontStyles.normal
	},
	divider: {
		width: '100%',
		height: 1,
		backgroundColor: colors.$F0F0F0
	},
	faqTitle: {
		color: colors.$202020,
		fontSize: 18,
		...fontStyles.bold,
		alignSelf: 'center',
		marginBottom: 12
	},
	faqDesc: {
		color: colors.$202020,
		fontSize: 13,
		alignSelf: 'center',
		lineHeight: 23
	},
	approvalEmpty: {
		marginHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 28,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	approvalEmptyIcon: {
		position: 'relative',
		width: 56,
		height: 47,
		marginRight: 10
	},
	approvalEmptyText: {
		flex: 1,
		fontSize: 12,
		color: colors.$404040
	},
	dashboardWrapper: {
		paddingVertical: 30
	},
	dashboardText: {
		fontSize: 20,
		color: colors.$030319,
		lineHeight: 24,
		...fontStyles.semibold,
		marginBottom: 7,
		marginHorizontal: 24
	},
	coinInfoWrapper: {
		marginLeft: 18,
		marginRight: 24,
		marginTop: 8,
		flexDirection: 'row',
		alignItems: 'center'
	},
	coinInfoTextWrapper: {
		flex: 30,
		marginLeft: 4,
		marginRight: 6
	},
	coinInfoTitle: {
		fontSize: 16,
		lineHeight: 19,
		color: colors.$60657D
	},
	coinInfoValue: {
		fontSize: 10,
		lineHeight: 12,
		marginTop: 4,
		color: colors.$8F92A1
	},
	coinInfoBigValue: {
		fontSize: 24,
		lineHeight: 29,
		color: colors.$030319
	},
	coinInfoDivider: {
		flex: 1,
		height: 1,
		marginHorizontal: 24,
		marginTop: 24,
		marginBottom: 10,
		backgroundColor: colors.$F0F0F0
	},
	introText: {
		marginHorizontal: 24,
		marginTop: 20,
		fontSize: 18,
		lineHeight: 20,
		color: colors.$030319,
		...fontStyles.bold
	},
	introMsgText: {
		marginHorizontal: 24,
		marginTop: 6
	},
	loading: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	faucetContainer: {
		padding: 20
	},
	faucetContainerIcon: {
		alignItems: 'center',
		marginTop: 20
	},
	faucetTitle: {
		marginHorizontal: 24,
		marginTop: 10,
		fontSize: 18,
		lineHeight: 20,
		color: colors.$030319,
		...fontStyles.bold
	},
	faucetDescription: {
		marginHorizontal: 24,
		marginTop: 6,
		fontSize: 14,
		lineHeight: 19,
		color: colors.$8F92A1
	},
	faucetInfo: {
		fontSize: 14,
		marginBottom: 10
	},
	faucetLinks: {
		marginHorizontal: 24,
		marginTop: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},

	faucetLinkLabel: {
		fontSize: 14
	},
	faucetLink: {
		fontSize: 14
	},
	faucetButton: {
		marginHorizontal: 24,

		marginBottom: 24,
		marginTop: 24,
		backgroundColor: colors.brandPink300,
		padding: 10,
		borderRadius: 100,
		alignItems: 'center'
	},
	faucetButtonText: {
		color: colors.white,
		...fontStyles.medium,
		fontSize: 16
	},
	faucetButtonContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.paliBlue400,
		paddingRight: 24,
		paddingVertical: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		height: 40,
		justifyContent: 'center',
		position: 'absolute',
		bottom: -18,
		zIndex: 100,
		alignSelf: 'center'
	},
	faucetButtonIconContainer: {
		width: 40,
		height: 40,
		backgroundColor: '#3f6096',
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomLeftRadius: 8
	},
	faucetButtonTextContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 8
	},
	faucetButtonTextStyle: {
		color: colors.white,
		...fontStyles.normal,
		marginLeft: 8
	},
	faucetButtonTextUnderline: {
		textDecorationLine: 'underline'
	},
	faucetButtonImage: {
		width: 20,
		height: 20,
		zIndex: 1
	},
	faucetButtonImageMargin: {
		width: 20,
		height: 20,
		marginLeft: -5
	},
	faucetButtonImageNoMargin: {
		width: 20,
		height: 20
	},
	faucetLinksContainer: {
		marginHorizontal: 24,
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	faucetLinkText: {
		color: '#4D76B8',
		textDecorationLine: 'underline'
	},
	grabFaucetButton: {
		position: 'absolute',
		bottom: -18,
		zIndex: 100,
		alignSelf: 'center'
	},
	grabFaucetButtonContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.paliBlue400,
		paddingRight: 24,
		paddingVertical: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		height: 40,
		justifyContent: 'center'
	},
	grabFaucetIcon: {
		width: 40,
		height: 40,
		backgroundColor: '#3f6096',
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomLeftRadius: 8
	},
	iconsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 8
	}
});

const htmlStyle = StyleSheet.create({
	// eslint-disable-next-line react-native/no-unused-styles
	p: {
		fontSize: 14,
		lineHeight: 19,
		color: colors.$8F92A1
	}
});

const faucetContractAddress = '0x35EE5876Db071b527dC62FD3EE3c32e4304d8C23';

/**
 * View that renders a list of transactions for a specific asset
 */
class AssetView extends PureComponent {
	static contextType = ThemeContext;
	static propTypes = {
		selectedAddress: PropTypes.string,
		scrollViewRef: PropTypes.any,
		style: PropTypes.any,
		navigation: PropTypes.object,
		header: PropTypes.object,
		asset: PropTypes.object,
		myApprovalEvents: PropTypes.object,
		approveModalVisibleInModal: PropTypes.bool,
		isLockScreen: PropTypes.bool,
		toggleShowHint: PropTypes.func,
		currencyCode: PropTypes.string,
		currencyCodeRate: PropTypes.number
	};

	state = {
		selectedTx: (new Map(): Map<string, boolean>),
		refreshing: false,
		speedUpConfirmDisabled: false,
		data: {
			dataSets: []
		},
		isLoading: false,
		faucetButtonDisabled: false,
		ticker: null,
		tvHtmlContent: null,
		hideChart: false,
		xAxis: {},
		yAxis: {},
		timeArray: [],
		coinGeckoId: null
	};

	requestNowButtonRef = React.createRef();
	moveTabOrSendTabLoading = false;
	tabView = React.createRef();
	showingSendModal = false;

	toDateFormat = timestamp => {
		const dateObj = new Date(timestamp);
		const month = dateObj.getMonth() + 1;
		const day = dateObj.getDate();
		return `${month}/${day}`;
	};

	/**
	 * For GFW users, load chart from CoinGecko.
	 * Else load from TV. If Tv no symbol, load CG.
	 */
	initChart = async queryId => {
		(await util.isEtherscanAvailableAsync())
			? this.initTradingView().then(result => {
					if (result) {
						this.initTvHtmlContent().then(end => {
							if (!end) {
								this.initCoinGecko(queryId);
							}
						});
					} else {
						this.initCoinGecko(queryId);
					}
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  })
			: this.initCoinGecko(queryId);
	};

	initCoinGeckoId = async () => {
		const { asset } = this.props;
		const queryId = await getQueryId(asset.type, asset.nativeCurrency, asset.address);
		this.setState({ coinGeckoId: queryId });
		return queryId;
	};

	initCoinGecko = async queryId => {
		const { TokenRatesController } = Engine.context;
		if (!queryId) {
			return;
		}

		const { info, load } = await TokenRatesController.getOHLC(queryId, 14);
		this.updateCoinGeckoData(queryId, info);
		if (load) {
			const nowInfo = await TokenRatesController.loadOHLC(queryId, 14);
			this.updateCoinGeckoData(queryId, nowInfo);
		}
	};

	updateCoinGeckoData = (queryId, datas) => {
		if (!datas || datas.length <= 0) {
			console.info("CoinGecko doesn't have " + queryId + ' OHLC.');
			this.setState({ hideChart: true });
			return;
		}
		datas = datas.map(info => ({
			shadowH: info.high,
			shadowL: info.low,
			open: info.open,
			close: info.close,
			time: info.time
		}));

		const limitArray = [];
		datas.forEach((item, i) => {
			if (i !== 0 && i % 12 === 0) {
				limitArray.push({
					limit: i,
					lineColor: processColor('transparent'),
					lineWidth: 0,
					label: this.toDateFormat(item.time),
					labelPosition: 'LEFT_BOTTOM',
					valueTextColor: processColor(colors.$74788D)
				});
			}
		});

		this.setState({
			data: {
				dataSets: [
					{
						values: datas,
						label: 'fdsd',
						config: {
							shadowWidth: 1,
							shadowColorSameAsCandle: true,
							neutralColor: processColor('#09C285'),
							increasingColor: processColor('#09C285'),
							increasingPaintStyle: 'FILL',
							decreasingColor: processColor('#FC6564')
						}
					}
				]
			},
			timeArray: limitArray,
			xAxis: {
				drawLabels: false,
				drawGridLines: false,
				position: 'BOTTOM'
			},
			yAxis: {
				left: {
					textColor: processColor(colors.$74788D)
				},
				right: {
					enabled: false
				}
			}
		});
		this.setState({ hideChart: false });
		console.info('CoinGecko OHLC ' + queryId + ' fetched.');
	};

	initTvHtmlContent = async () => {
		try {
			const fileContent = await EntryScriptWeb3.getTVhtml();
			// eslint-disable-next-line no-empty
			if (fileContent) {
				this.setState({ tvHtmlContent: fileContent + `?theme=dark` });
				return true;
			}
			// eslint-disable-next-line no-empty
		} catch (e) {}
		return false;
	};

	initTradingView = async () => {
		const { asset } = this.props;
		const { TokenRatesController } = Engine.context;
		const { ticker, load } = await TokenRatesController.getTvSymbol(asset.symbol);

		if (ticker) {
			const newTicker = extractTicker(ticker);
			this.setState({ ticker: newTicker });
			return true;
		} else if (load) {
			let nowTicker;
			try {
				const response = await fetch(`https://www.tradingview.com/symbols/${asset.symbol}USDT/`, {
					method: 'HEAD'
				});
				if (response.status === 200) {
					console.log('Successful fetch for TradingView symbol.', asset.symbol);
					nowTicker = asset.symbol;
				} else if (response.status === 404) {
					console.log('TradingView symbol fetch resulted in 404 error.');
					return false;
				} else {
					console.log(`Unhandled response status: ${response.status}`);
					return false;
				}
			} catch (error) {
				console.error('Error fetching TradingView symbol:', error);
				return false;
			}

			if (nowTicker) {
				const extractedTicker = appendTickerSuffix(nowTicker);

				this.setState({ ticker: extractedTicker });
			}

			return !!nowTicker;
		}
		return false;
	};

	/**
	 * Send message to html to start TradingView Chart with Symbol and language and any other config you need.
	 * @const {string} scriptStart Script start part. If function name in html changed this should be changed too.
	 * @example JSscript = scriptStart + param1 + paramsDivider + param2 + paramsDivider  + ... + paramN + scriptEnd.
	 */
	startTvChart = () => {
		// Script pieces
		const scriptStart = "startChart('";
		const scriptEnd = "')";
		const paramsDivider = "','";
		const language = I18n.locale;
		const { theme } = this.context;

		// Include theme in the parameters
		const JSscript = `${scriptStart}${
			this.state.ticker
		}${paramsDivider}${language}${paramsDivider}${theme}${paramsDivider}${scriptEnd}`;
		this.tradingViewChart.injectJavaScript(JSscript);
		console.info('JSscript = ' + JSscript);
		console.info("Injected to TradingView's webview");
	};

	initCoinInfo = async queryId => {
		const { TokenRatesController } = Engine.context;
		const { asset } = this.props;
		if (!queryId) {
			return;
		}
		try {
			const { coinInfo, load } = await TokenRatesController.getCoinInfo(queryId);
			this.setState({ coinInfo });
			if (load) {
				const nowInfo = await TokenRatesController.loadCoinInfo(queryId, asset.address, asset.type);
				if (nowInfo) {
					this.setState({ coinInfo: nowInfo });
				}
			}
		} catch (e) {
			util.logWarn('PPYang getCoinInfo e:', e);
		}
	};

	componentDidMount = async () => {
		const queryId = await this.initCoinGeckoId();
		await this.initChart(queryId);
		await this.initCoinInfo(queryId);
	};

	goBack = () => {
		this.props.navigation.goBack();
	};

	showInfiniteDesc = () => {
		this.setState({ infiniteDescVisible: true });
	};

	hideInfiniteDesc = () => {
		this.setState({ infiniteDescVisible: false });
	};

	renderApproveModalInModal = () =>
		this.props.approveModalVisibleInModal && (
			<Approve modalVisible toggleApproveModal={() => store.dispatch(toggleApproveModalInModal())} />
		);

	renderApprovalPanel = () => {
		const { myApprovalEvents, asset } = this.props;
		if (asset.nativeCurrency) {
			return;
		}
		const chainId = getChainIdByType(asset.type);
		const singleChainTokens = myApprovalEvents?.[chainId] || {};
		const eventGroup = singleChainTokens?.[asset.address] || singleChainTokens?.[asset.address.toLowerCase()] || {};
		const approvals = eventGroup.approvals || {};
		const spenders = Object.keys(approvals);
		const eventList = [];
		for (let i = 0; i < spenders.length; i++) {
			const spender = spenders[i];
			const event = approvals[spender];
			if (event.allowance > 0) {
				eventList.push(event);
			}
		}
		eventList.sort((a, b) => b.timestamp - a.timestamp);
		const isRpc = util.isRpcChainType(asset.type);
		const { isDarkMode } = this.context;
		return (
			<ImageCapInset
				style={[styles.cardWrapper, styles.bodyMargin]}
				source={
					Device.isAndroid()
						? isDarkMode
							? { uri: 'dark800_card' }
							: { uri: 'default_card' }
						: isDarkMode
						? require('../../../images/dark800_card.png')
						: require('../../../images/default_card.png')
				}
				capInsets={baseStyles.capInsets}
			>
				<View style={styles.otherBody}>
					<Text style={[styles.approvalTitle, isDarkMode && baseStyles.textDark]}>
						{strings('approval_management.token_title')}
					</Text>
					<Text style={[styles.approvalHint, isDarkMode && baseStyles.subTextDark]}>
						{strings('approval_management.hint')}
					</Text>
					<View style={[styles.divider, isDarkMode && { backgroundColor: '#FFFFFF29' }]} />
					{eventList.map((event, i) => (
						<ApprovalEvent
							key={i}
							chainId={chainId}
							event={event}
							tokenInfo={asset}
							showInfiniteDesc={this.showInfiniteDesc}
						/>
					))}
					{eventList.length === 0 && (
						<View style={styles.approvalEmpty}>
							<Image style={styles.approvalEmptyIcon} source={require('../../../images/notx.png')} />
							<Text style={[styles.approvalEmptyText, isDarkMode && baseStyles.textDark]}>
								{strings(isRpc ? 'approval_management.empty_rpc' : 'approval_management.empty')}
							</Text>
						</View>
					)}
				</View>
			</ImageCapInset>
		);
	};

	renderInfiniteDesc = () => {
		const { isDarkMode } = this.context;
		return (
			<Modal
				isVisible={this.state.infiniteDescVisible && !this.props.isLockScreen}
				actionContainerStyle={styles.modalNoBorder}
				onSwipeComplete={this.hideInfiniteDesc}
				onBackButtonPress={this.hideInfiniteDesc}
				onBackdropPress={this.hideInfiniteDesc}
				backdropOpacity={0.7}
				animationIn={'fadeIn'}
				animationOut={'fadeOut'}
				useNativeDriver
			>
				<TouchableWithoutFeedback onPress={this.hideInfiniteDesc}>
					<View style={[styles.modalContainer, isDarkMode && baseStyles.darkBackground]}>
						<View>
							<Text style={[styles.faqTitle, isDarkMode && baseStyles.textDark]}>
								{strings('approval_management.intro_title')}
							</Text>
							<Text style={[styles.faqDesc, isDarkMode && baseStyles.textDark]}>
								{strings('approval_management.intro_text')}
							</Text>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</Modal>
		);
	};

	getCoinIntro = (assetType, defaultIntro) => {
		switch (assetType) {
			case 256:
				return syscoinIntro;
			case 512:
				return rolluxIntro;
			default:
				return defaultIntro;
		}
	};

	renderCoinInfo = () => {
		const { coinInfo } = this.state;
		const { asset, currencyCode, currencyCodeRate } = this.props;
		const liquidity = coinInfo?.liquidity ? convertUsdValue(coinInfo.liquidity, currencyCodeRate) : undefined;
		const totalVolume = coinInfo?.totalVolume ? convertUsdValue(coinInfo.totalVolume, currencyCodeRate) : undefined;
		const ath = coinInfo?.ath ? convertUsdValue(coinInfo.ath, currencyCodeRate) : undefined;
		const marketCap = coinInfo?.marketCap ? convertUsdValue(coinInfo.marketCap, currencyCodeRate) : undefined;
		const fdv = coinInfo?.fdv ? convertUsdValue(coinInfo.fdv, currencyCodeRate) : undefined;

		const coinIntro = asset.nativeCurrency ? this.getCoinIntro(asset.type, coinInfo?.intro || '') : '';
		const { isDarkMode } = this.context;
		return (
			<ImageCapInset
				style={[styles.cardWrapper, styles.bodyMargin]}
				source={
					Device.isAndroid()
						? isDarkMode
							? { uri: 'dark800_card' }
							: { uri: 'default_card' }
						: isDarkMode
						? require('../../../images/dark800_card.png')
						: require('../../../images/default_card.png')
				}
				capInsets={baseStyles.capInsets}
			>
				<View style={[styles.otherBody, styles.dashboardWrapper]}>
					<Text style={[styles.dashboardText, isDarkMode && baseStyles.textDark]}>
						{strings('other.token_dashboard', { token: asset.symbol })}
					</Text>
					{this.renderSubCoinInfo(
						ic_liquidity,
						strings('other.liquidity'),
						onlyAddCurrencySymbol(liquidity, currencyCode),
						onlyAddCurrencySymbol(renderCoinValue(liquidity), currencyCode)
					)}
					{this.renderSubCoinInfo(
						ic_volume,
						strings('other.24h_Volume'),
						onlyAddCurrencySymbol(totalVolume, currencyCode),
						onlyAddCurrencySymbol(renderCoinValue(totalVolume), currencyCode)
					)}
					{this.renderSubCoinInfo(
						ic_ath,
						strings('other.all_time_high'),
						onlyAddCurrencySymbol(ath, currencyCode),
						onlyAddCurrencySymbol(renderCoinValue(ath), currencyCode)
					)}
					{this.renderSubCoinInfo(
						ic_market_cap,
						strings('other.market_cap'),
						onlyAddCurrencySymbol(marketCap, currencyCode),
						onlyAddCurrencySymbol(renderCoinValue(marketCap), currencyCode)
					)}
					{this.renderSubCoinInfo(ic_mc_rank, strings('other.mc_rank'), coinInfo?.mcRank, coinInfo?.mcRank)}
					{this.renderSubCoinInfo(
						ic_total_supply,
						strings('other.total_supply'),
						coinInfo?.totalSupply,
						renderCoinValue(coinInfo?.totalSupply)
					)}
					{this.renderSubCoinInfo(
						ic_circulation,
						strings('other.circulation'),
						coinInfo?.circulation,
						renderCoinValue(coinInfo?.circulation)
					)}
					{this.renderSubCoinInfo(
						ic_fdv,
						strings('other.fdv'),
						onlyAddCurrencySymbol(fdv, currencyCode),
						onlyAddCurrencySymbol(renderCoinValue(fdv), currencyCode)
					)}
					{(!!asset.address || !!coinInfo?.intro) && <View style={styles.coinInfoDivider} />}
					{!!asset.address && (
						<TouchableOpacity
							onPress={() => {
								this.onCopyCoinInfo(strings('other.coin_contract_address'), asset.address);
							}}
							activeOpacity={0.8}
						>
							<Text style={[styles.introText, isDarkMode && baseStyles.textDark]}>
								{strings('other.coin_contract_address')}
							</Text>
							<Text style={[styles.introMsgText, htmlStyle.p]} numberOfLines={1} ellipsizeMode={'middle'}>
								{asset.address}
							</Text>
						</TouchableOpacity>
					)}
					{!!coinIntro && (
						<>
							<Text style={[styles.introText, isDarkMode && baseStyles.textDark]}>
								{strings('other.coin_intro')}
							</Text>
							<HTMLView
								style={[styles.introMsgText]}
								stylesheet={htmlStyle}
								value={'<p>' + coinIntro + '</p>'}
								onLinkPress={url => {
									this.props.navigation.navigate('BrowserTabHome');
									this.props.navigation.navigate('BrowserView', {
										newTabUrl: url,
										chainType: asset.type
									});
								}}
							/>
						</>
					)}
				</View>
			</ImageCapInset>
		);
	};

	onCopyCoinInfo = (name, value) => {
		Clipboard.setString(value.toString());
		this.props.toggleShowHint(strings('other.copied', { str: name }));
	};

	renderSubCoinInfo = (image, name, value, value2) => {
		const { isDarkMode } = this.context;
		return (
			<TouchableOpacity
				style={styles.coinInfoWrapper}
				onPress={() => {
					this.onCopyCoinInfo(name, value);
				}}
				activeOpacity={0.8}
				disabled={!value}
			>
				<Image source={image} />
				<View style={styles.coinInfoTextWrapper}>
					<Text style={[styles.coinInfoTitle, isDarkMode && baseStyles.textDark]}>{name}</Text>
					{!!value && (
						<Text
							style={[styles.coinInfoValue, isDarkMode && baseStyles.textDark]}
							numberOfLines={1}
							ellipsizeMode={'tail'}
						>
							{value}
						</Text>
					)}
				</View>
				<View style={baseStyles.flexGrow} />
				<Text style={[styles.coinInfoBigValue, isDarkMode && baseStyles.textDark]}>{value2 || '--'}</Text>
			</TouchableOpacity>
		);
	};

	renderAsset = () => {
		const { timeArray, data, coinGeckoId, ticker, tvHtmlContent, hideChart } = this.state;
		const { isDarkMode } = this.context;
		return (
			<>
				{!hideChart && (!!coinGeckoId || !!ticker) && (
					<ImageCapInset
						style={[styles.cardWrapper, styles.bodyMargin]}
						source={
							Device.isAndroid()
								? isDarkMode
									? require('../../../images/dark800_card.png')
									: { uri: 'default_card' }
								: isDarkMode
								? require('../../../images/dark800_card.png')
								: require('../../../images/default_card.png')
						}
						capInsets={baseStyles.capInsets}
					>
						<View style={styles.otherBody}>
							{!!ticker && !!tvHtmlContent ? (
								<WebView
									source={{ html: this.state.tvHtmlContent }}
									containerStyle={isDarkMode}
									style={[
										styles.chart,
										isDarkMode && [baseStyles.darkInputBackground, { borderRadius: 0 }]
									]}
									ref={WebView => {
										this.tradingViewChart = WebView;
									}}
									onLoadEnd={() => this.startTvChart()}
								/>
							) : data?.dataSets?.length > 0 ? (
								<View style={[styles.chartLayout]}>
									<Text style={[styles.chartTrading, isDarkMode && baseStyles.textDark]}>
										{strings('other.trading')}
									</Text>
									<CandleStickChart
										style={[styles.chart]}
										data={this.state.data}
										chartDescription={{ text: '' }}
										xAxis={this.state.xAxis}
										yAxis={this.state.yAxis}
										maxVisibleValueCount={1}
										autoScaleMinMaxEnabled
										touchEnabled={false}
										legend={{ enabled: false }}
										animation={{ durationX: 500 }}
									/>
									<View style={styles.timeArrayLayout}>
										{timeArray.map((value, index) => (
											<Text key={'element-' + index} style={styles.timeArrayLabel}>
												{value.label}
											</Text>
										))}
									</View>
								</View>
							) : (
								<View
									style={[
										styles.chart,
										styles.chartLayout,
										isDarkMode && baseStyles.darkBackground600,
										styles.loading
									]}
								>
									<ActivityIndicator size="large" color={colors.brandPink300} />
								</View>
							)}
						</View>
					</ImageCapInset>
				)}

				{this.renderCoinInfo()}
				{this.renderApprovalPanel()}
			</>
		);
	};

	goWeb = url => {
		this.props.navigation.navigate('BrowserTabHome');
		this.props.navigation.navigate('BrowserView', {
			newTabUrl: url
		});
	};

	navigateToRequestNowButton = () => {
		if (this.requestNowButtonRef.current && this.props.scrollViewRef) {
			this.requestNowButtonRef.current.measure((fx, fy, width, height, px, py) => {
				this.props.scrollViewRef.scrollTo({ x: 0, y: py - fy - 300, animated: true });
			});
		} else {
			console.log('Request Now button reference is not available.');
		}
	};
	render = () => {
		const { header, asset, style } = this.props;
		const { isDarkMode } = this.context;
		const { selectedAddress } = this.props;

		const getNetworkKey = () => {
			const symbol = asset.symbol;
			const chainType = asset.type;

			if (symbol.toUpperCase() === 'SYS' || symbol.toUpperCase() === 'TSYS') {
				if (chainType === ChainType.Syscoin) {
					return symbol.toUpperCase() === 'SYS' ? 'nevm-mainnet' : 'nevm-testnet';
				} else if (chainType === ChainType.Rollux) {
					return symbol.toUpperCase() === 'SYS' ? 'rollux-mainnet' : 'rollux-testnet';
				}
			}
			return '';
		};

		const requestFaucet = async () => {
			const networkKey = getNetworkKey();
			if (!networkKey) {
				console.error('Unsupported asset type or symbol for faucet request');
				return;
			}

			const endpoint = `https://chains.tools/api/faucet/claim?networkKey=${networkKey}&walletAddress=${selectedAddress}`;
			this.setState({ isLoading: true });
			this.setState({ faucetButtonDisabled: true });
			try {
				const response = await fetch(endpoint, { method: 'GET' });
				const data = await response.json();
				if (data.status) {
					let amountReceived;
					if (networkKey.includes('testnet')) {
						amountReceived = '1 TSYS';
					} else if (networkKey.includes('rollux-mainnet')) {
						amountReceived = '0.001 SYS';
					} else if (networkKey.includes('nevm-mainnet')) {
						amountReceived = '0.01 SYS';
					}

					this.props.toggleShowHint(strings('faucet.request_successful', { amountReceived }), 'success');
					console.log('Faucet request successful:', data);
				} else {
					const requestFailedString = networkKey.includes('testnet')
						? strings('faucet.request_failed_testnet')
						: strings('faucet.request_failed');
					this.props.toggleShowHint(requestFailedString, 'error');

					console.log('Faucet request failed:', data.message);
				}
			} catch (error) {
				this.setState({ faucetButtonDisabled: false });
				this.props.toggleShowHint(strings('faucet.error_request'), 'error');
				console.log('Error making faucet request:', error);
			} finally {
				this.setState({ isLoading: false });
			}
		};

		const getExplorerLink = chainType => {
			const contractAddress = '0x35EE5876Db071b527dC62FD3EE3c32e4304d8C23';
			let baseUrl;
			const isTestnet = asset.symbol.toUpperCase() === 'TSYS';

			switch (chainType) {
				case ChainType.Syscoin:
					baseUrl = isTestnet ? 'https://tanenbaum.io/address/' : 'https://explorer.syscoin.org/address/';
					break;
				case ChainType.Rollux:
					baseUrl = isTestnet
						? 'https://rollux.tanenbaum.io/address/'
						: 'https://explorer.rollux.com/address/';
					break;
				default:
					return null;
			}

			return `${baseUrl}${contractAddress}`;
		};

		const getFaucetAmount = () => {
			const networkKey = getNetworkKey();
			if (networkKey.includes('testnet')) {
				return '1 TSYS';
			} else if (networkKey.includes('rollux-mainnet')) {
				return '0.001 SYS';
			} else if (networkKey.includes('nevm-mainnet')) {
				return '0.01 SYS';
			}
			return 'an unknown amount';
		};

		return (
			<View style={[styles.wrapper, style && style]} activeOpacity={1}>
				<ImageCapInset
					style={[styles.cardWrapper, styles.headerMargin]}
					source={
						Device.isAndroid()
							? isDarkMode
								? { uri: 'dark800_card' }
								: { uri: 'dark500_card' }
							: isDarkMode
							? require('../../../images/dark800_card.png')
							: require('../../../images/dark500_card.png')
					}
					capInsets={baseStyles.capInsets}
				>
					<View style={[styles.otherBody]}>{header}</View>
					{(asset.type === ChainType.Syscoin || asset.type === ChainType.Rollux) &&
						!Device.isAndroid() &&
						asset.nativeCurrency && (
							<TouchableOpacity
								activeOpacity={0.8}
								style={styles.grabFaucetButton}
								onPress={() => {
									this.navigateToRequestNowButton();
								}}
							>
								<View style={styles.grabFaucetButtonContainer}>
									<View style={styles.grabFaucetIcon}>
										<Icon name="faucet" style={{ color: colors.white }} />
									</View>
									<View style={styles.iconsContainer}>
										{asset.type === ChainType.Rollux && (
											<Image
												source={require('../../../images/rollux_logo.png')}
												style={[styles.iconAssetStyle, { zIndex: 1 }]}
											/>
										)}
										<Image
											source={require('../../../images/syscoin_logo.png')}
											style={[
												styles.iconAssetStyle,
												{
													marginLeft: asset.type === ChainType.Rollux ? -5 : 0
												}
											]}
										/>
									</View>
									<Text style={{ color: colors.white, ...fontStyles.normal, marginLeft: 8 }}>
										<Text style={{ textDecorationLine: 'underline' }}>
											{strings('faucet.grab_with_faucet', { symbol: asset.symbol })}
										</Text>{' '}
										{strings('faucet.with_our_faucet')}
									</Text>
								</View>
							</TouchableOpacity>
						)}
				</ImageCapInset>
				<View
					style={{
						marginTop:
							(asset.type === ChainType.Syscoin || asset.type === ChainType.Rollux) &&
							!Device.isAndroid() &&
							asset.nativeCurrency
								? 40
								: 0
					}}
				>
					{asset.lockType ? (
						<ImageCapInset
							style={[styles.cardWrapper, styles.bodyMargin]}
							source={
								Device.isAndroid()
									? isDarkMode
										? { uri: 'dark800_card' }
										: { uri: 'default_card' }
									: isDarkMode
									? require('../../../images/dark800_card.png')
									: require('../../../images/default_card.png')
							}
							capInsets={baseStyles.capInsets}
						>
							<View style={[styles.otherBody]}>
								<Locked asset={asset} onClose={this.goBack} />
							</View>
						</ImageCapInset>
					) : (
						this.renderAsset()
					)}
				</View>
				{(asset.type === ChainType.Syscoin || asset.type === ChainType.Rollux) && asset.nativeCurrency && (
					<ImageCapInset
						style={[styles.cardWrapper, styles.headerMargin]}
						source={
							Device.isAndroid()
								? isDarkMode
									? { uri: 'dark800_card' }
									: { uri: 'default_card' }
								: isDarkMode
								? require('../../../images/dark800_card.png')
								: require('../../../images/default_card.png')
						}
						capInsets={baseStyles.capInsets}
					>
						<View style={[styles.faucetContainer]}>
							<View style={[styles.faucetContainerIcon]}>
								<TokenImage asset={asset} iconStyle={styles.iconStyle} fadeIn={false} />
							</View>
							<Text style={[styles.faucetTitle, isDarkMode && baseStyles.textDark]}>
								{strings(
									asset.type === ChainType.Syscoin ? 'faucet.syscoin_faucet' : 'faucet.rollux_faucet'
								)}
							</Text>
							<Text style={styles.faucetDescription}>
								{strings('faucet.grab_sys_with_faucet', { symbol: asset.symbol })}
							</Text>
							<Text style={styles.faucetDescription}>
								{strings('faucet.get_faucet_amount', {
									amount: getFaucetAmount(),
									time: getNetworkKey().includes('testnet') ? '60 minutes' : '24h'
								})}
							</Text>
							<View style={[styles.faucetLinks]}>
								<Text style={[styles.faucetLinkLabel, { color: '#4D76B8' }]}>
									{strings('faucet.smart_contract')}
								</Text>
								<TouchableOpacity onPress={() => this.goWeb(getExplorerLink(asset.type))}>
									<Text
										style={[
											styles.faucetLink,

											{ color: '#4D76B8', textDecorationLine: 'underline' }
										]}
									>
										{`${faucetContractAddress.slice(0, 5)}...${faucetContractAddress.slice(-5)}`}
									</Text>
								</TouchableOpacity>
							</View>
							<View style={[styles.faucetLinks]}>
								<Text style={[styles.faucetLinkLabel, isDarkMode && baseStyles.textDark]}>
									{strings('faucet.your_wallet')}
								</Text>
								<Text style={[styles.faucetLink, isDarkMode && baseStyles.textDark]}>
									{`${selectedAddress.slice(0, 5)}...${selectedAddress.slice(-5)}`}
								</Text>
							</View>
							<TouchableOpacity
								ref={this.requestNowButtonRef}
								activeOpacity={0.6}
								style={[
									{
										...styles.faucetButton,
										justifyContent: 'center',
										alignItems: 'center'
									},
									isDarkMode && { backgroundColor: colors.paliBlue400 },
									{ height: 45, opacity: this.state.faucetButtonDisabled ? 0.5 : 1 }
								]}
								onPress={requestFaucet}
								disabled={this.state.isLoading || this.state.faucetButtonDisabled}
							>
								{this.state.isLoading ? (
									<ActivityIndicator size="small" color={colors.white} />
								) : (
									<Text style={[styles.faucetButtonText, { textAlign: 'center' }]}>
										{strings('faucet.request_now')}
									</Text>
								)}
							</TouchableOpacity>
						</View>
					</ImageCapInset>
				)}
				{this.renderInfiniteDesc()}
				{this.renderApproveModalInModal()}
			</View>
		);
	};
}

const mapStateToProps = state => ({
	approveModalVisibleInModal: state.modals.approveModalVisibleInModal,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	myApprovalEvents:
		state.engine.backgroundState.ApprovalEventsController.allEvents?.[
			state.engine.backgroundState.PreferencesController.selectedAddress
		] || {},
	isLockScreen: state.settings.isLockScreen,
	currencyCode: state.engine.backgroundState.TokenRatesController.currencyCode,
	currencyCodeRate: state.engine.backgroundState.TokenRatesController.currencyCodeRate
});

const mapDispatchToProps = dispatch => ({
	toggleShowHint: (hintText, hintType) => dispatch(toggleShowHint(hintText, hintType))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AssetView);
