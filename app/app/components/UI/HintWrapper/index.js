import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import HintView from '../HintView';
import { View } from 'react-native';

class HintWrapper extends PureComponent {
	static propTypes = {
		hintText: PropTypes.string,
		showHintView: PropTypes.bool,
		hintType: PropTypes.string
	};

	render() {
		const { showHintView, hintText, hintType } = this.props;
		return showHintView ? <HintView hintText={hintText} hintType={hintType} /> : <View />;
	}
}

const mapStateToProps = state => ({
	showHintView: state.hint.showHint,
	hintText: state.hint.hintText
});

const mapDispatchToProps = dispatch => ({});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(HintWrapper);
