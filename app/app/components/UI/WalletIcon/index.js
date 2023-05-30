import { Animated, Easing, DeviceEventEmitter } from 'react-native';
import React, { useEffect, useRef } from 'react';
import Icon from '../Icon';
import { colors } from '../../../styles/common';

const WalletIcon = ({ focused }) => {
	const scale = useRef(new Animated.Value(focused ? 1.15 : 1)).current;
	const color = focused ? colors.brandPink300 : colors.$9B989B;

	useEffect(() => {
		Animated.timing(scale, {
			toValue: focused ? 1.15 : 1,
			duration: 300,
			useNativeDriver: true
		}).start();
	}, [focused, scale]);

	return (
		<Animated.View
			style={{
				transform: [{ scale }],
				marginTop: 5
			}}
		>
			<Icon width="22" height="22" color={color} name="wallet" />
		</Animated.View>
	);
};

export default WalletIcon;
