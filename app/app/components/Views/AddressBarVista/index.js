import React, { PureComponent } from 'react';
import {
	Image,
	Platform,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
	StatusBar,
	Text,
	ImageBackground,
	Dimensions,
	DeviceEventEmitter
} from 'react-native';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import Device from '../../../util/Device';
import { strings } from '../../../../locales/i18n';
import { URL, util } from 'vistawallet-core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageCapInset from '../../UI/ImageCapInset';
import AppConstants from '../../../core/AppConstants';
import { getActiveTabId } from '../../../util/browser';
import { captureRef, dirs } from 'react-native-view-shot';
import RNFS from 'react-native-fs';

const styles = StyleSheet.create({
	topTabbar: {
		justifyContent: 'center',
		flexDirection: 'row',
		height: 58,
		alignItems: 'center'
	},
	textInput: {
		height: 58,
		padding: 0,
		justifyContent: 'center',
		color: colors.$030319,
		fontSize: 14,
		flexShrink: 1
	},
	flexOne: {
		flex: 1
	},
	hitSlop: {
		top: 10,
		left: 10,
		bottom: 10,
		right: 10
	},
	noDisplay: {
		width: 0,
		height: 0,
		display: 'none'
	},
	baseLayout: {
		height: 58,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},
	catInsertLeft: {
		marginLeft: 14
	},
	inputBaseLayout: {
		height: 58,
		flex: 1,
		justifyContent: 'center'
	},
	operateLayout: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16
	},
	cancelLayout: {
		paddingHorizontal: 12,
		height: 58,
		justifyContent: 'center'
	},
	cancelLabel: {
		fontSize: 14,
		color: colors.$030319
	},
	leftTabBg: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 47,
		height: 58,
		paddingRight: 5
	},
	rightTabBg: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 47,
		height: 58,
		paddingLeft: 5
	},
	flexRow: {
		flexDirection: 'row'
	},
	hide: {
		flex: 0,
		opacity: 0,
		display: 'none',
		width: 0,
		height: 0
	},
	inputRightView: {
		flex: 1,
		marginLeft: 10
	},
	touchSecurity: {
		marginRight: 6
	},
	iconSize: {
		width: 24,
		height: 24,
		borderRadius: 12
	},
	full: {
		flex: 100000
	}
});

const { HOMEPAGE_URL } = AppConstants;
const screenWidth = Dimensions.get('window').width;

export default class AddressBarVista extends PureComponent {
	static propTypes = {
		onFocusChange: PropTypes.func,
		onTextChange: PropTypes.func,
		toggleSecurityModal: PropTypes.func,
		onSubmit: PropTypes.func,
		toggleTipModal: PropTypes.func,
		goHome: PropTypes.func,
		switchRightTab: PropTypes.func,
		leftTabUrl: PropTypes.string,
		rightTabUrl: PropTypes.string,
		tabId: PropTypes.number,
		closeTab: PropTypes.func,
		title: PropTypes.string,
		url: PropTypes.string,
		tabCount: PropTypes.number,
		navigation: PropTypes.object,
		tabRef: PropTypes.object,
		updateTab: PropTypes.func,
		tabData: PropTypes.object,
		gotoOpenedPages: PropTypes.func,
		showOpenedTabs: PropTypes.bool,
		newTab: PropTypes.func
	};

	state = {
		inputValue: '',
		inputEditing: false,
		safeLevel: -1, //安全级别：0：未知，1:安全，2：警告，3：危险, -1未获取
		safeDesc: '',
		safeHostUrl: '',
		hasShownTip: false,
		currentTitle: this.props.title,
		currentUrl: this.props.url,
		backEnabled: false
	};

	inputTextRef = React.createRef();
	securityButtonRef = React.createRef();
	moreButtonRef = React.createRef();
	imageRef = React.createRef();

	componentDidMount = () => {
		AsyncStorage.getItem('hasShownMoreTip').then(previouslyShown => {
			if (previouslyShown === 'true') {
				this.setState({ hasShownTip: true });
			}
		});
	};

	showSecurityMenu = async => {
		let safeLevel = this.state.safeLevel;
		const currentHostName = new URL(this.state.currentUrl).hostname;
		if (currentHostName !== this.state.safeHostUrl) {
			safeLevel = -1;
		}
		if (safeLevel !== -1) {
			const { current } = this.securityButtonRef;
			current.measure((ox, oy, width, height, px, py) => {
				const statusBarHeight = StatusBar.currentHeight;
				const dis = Device.isAndroid() ? statusBarHeight : 0;
				this.props.toggleSecurityModal(safeLevel, this.state.safeDesc, {
					x: px - 10,
					y: py - dis,
					width,
					height
				});
			});
		}
	};

	setInputEditing = editing => {
		if (this.state.inputEditing === editing) {
			return;
		}
		this.setState({ inputEditing: editing, inputValue: '' });
		if (!editing) {
			this.props.onFocusChange && this.props.onFocusChange(false);
		}
	};

	clearFocus = () => {
		const { current } = this.inputTextRef;
		current.blur();
	};

	getIsInputEditing = () => this.state.inputEditing;

	backPress = () => {
		const { inputEditing } = this.state;
		const { onFocusChange } = this.props;
		if (inputEditing) {
			this.setState({ inputValue: '', inputEditing: false });
			setTimeout(() => {
				onFocusChange && onFocusChange(false);
			}, 10);
			return true;
		}
		DeviceEventEmitter.emit('AddressbarStateEmitter', { state: 'back' });
		return true;
	};

	setSecurityInfo = (safeLevel, safeHostUrl, safeDesc) => {
		this.setState({ safeLevel, safeHostUrl, safeDesc });
		if (safeLevel === 0 && !this.state.hasShownTip) {
			const { current } = this.moreButtonRef;
			current?.measure((ox, oy, width, height, px, py) => {
				const statusBarHeight = StatusBar.currentHeight;
				const dis = Device.isAndroid() ? statusBarHeight : 0;
				this.props.toggleTipModal &&
					this.props.toggleTipModal(this.props.tabId, { x: px - 10, y: py - dis, width, height });
				this.setState({ hasShownTip: true });
			});
		}
	};

	setTitle = title => {
		this.setState({ currentTitle: title });
	};

	setUrl = url => {
		this.setState({ currentUrl: url });
	};

	setBackEnabled = enable => {
		this.setState({ backEnabled: enable });
	};

	captureImage = () => {
		const { id, ...tabDataFiltered } = this.props.tabData;

		captureRef(this.props.tabRef, { format: 'png', quality: 1 })
			.then(uri => {
				// save the image to a persistent location
				const timestamp = Date.now();
				const newImagePath = `${RNFS.DocumentDirectoryPath}/screenshot_${timestamp}.png`;
				RNFS.moveFile(uri, newImagePath)
					.then(() => {
						const updatedTabData = {
							...tabDataFiltered,
							uri: Device.isAndroid ? `file://${newImagePath}` : newImagePath
						};
						this.props.updateTab(this.props.tabId, updatedTabData);
					})
					.catch(err => {
						console.log('Failed to move image file: ', err);
					});
			})
			.catch(error => {
				util.logError('PPYang takeSnapshot browserTab error:', error);
			});
	};

	render = () => {
		const { inputValue, inputEditing, safeHostUrl } = this.state;
		const {
			onFocusChange,
			onTextChange,
			onSubmit,
			goHome,
			switchRightTab,
			leftTabUrl,
			rightTabUrl,
			tabId,
			closeTab,
			tabCount
		} = this.props;

		let { currentTitle } = this.state;
		const { currentUrl, backEnabled } = this.state;

		const isHomePage = !currentUrl || currentUrl === '' || currentUrl === HOMEPAGE_URL;

		let safeLevel = this.state.safeLevel;
		const currentHostName = new URL(currentUrl).hostname;
		if (currentHostName !== safeHostUrl) {
			safeLevel = -1;
		}

		if (!currentTitle) {
			if (currentHostName?.startsWith('www.')) {
				currentTitle = currentHostName.slice(4);
			} else if (currentHostName?.startsWith('m.')) {
				currentTitle = currentHostName.slice(2);
			} else {
				currentTitle = currentHostName;
			}
		}

		const onlyOneTab = rightTabUrl === 'add' && leftTabUrl === 'add';

		const webPageState = !isHomePage && !inputEditing;

		return (
			<View
				style={[
					styles.flexRow,
					{
						width: screenWidth,
						backgroundColor: colors.white
					}
				]}
			>
				
				<View style={styles.baseLayout}>
					<ImageCapInset
						style={[styles.flexOne, inputEditing && styles.catInsertLeft]} //上下9， 左右6
						source={
							Device.isAndroid()
								? { uri: 'token_search_bg' }
								: require('../../../images/token_search_bg.png')
						}
						capInsets={{
							top: 15,
							left: 12,
							bottom: 0,
							right: 15
						}}
					>
						<View style={styles.topTabbar}>
								<View style={styles.operateLayout}>
									<TouchableOpacity
										style={(inputEditing || (onlyOneTab && isHomePage)) && styles.noDisplay}
										disabled={this.props.showOpenedTabs}
										onPress={() => {
											if (isHomePage) {
												closeTab && closeTab(tabId);
											} else {
												DeviceEventEmitter.emit('AddressbarStateEmitter', { state: 'more' });
											}
										}}
										hitSlop={styles.hitSlop}
									>
										<Text>Settings</Text>
									</TouchableOpacity>
								</View>
						</View>
					</ImageCapInset>
				</View>
			</View>
		);
	};
}
