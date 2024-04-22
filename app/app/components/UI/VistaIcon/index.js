import { Animated, DeviceEventEmitter, StyleSheet, View, Easing } from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Icon from '../Icon';
import { colors } from '../../../styles/common';

const styles = StyleSheet.create({
	globeContainer: {
		marginTop: 5,
		width: 28,
		height: 28,
		overflow: 'visible',
		alignItems: 'center',
		justifyContent: 'center'
	}
});

const VistaIcon = ({ focused }) => {
	const scale = useRef(new Animated.Value(1)).current;
	const color = focused ? colors.brandPink300 : colors.$9B989B;


	return (
		<View style={styles.globeContainer}>
			<Animated.View
				
			>
				<Icon width="22" height="22" color={color} name="vista" />
			</Animated.View>
		</View>
	);
};

export default VistaIcon;
