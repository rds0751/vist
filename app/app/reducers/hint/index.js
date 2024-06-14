import { REHYDRATE } from 'redux-persist';

const initialState = {
	showHint: false,
	hintText: '',
	hintType: 'success'
};

const alertReducer = (state = initialState, action) => {
	switch (action.type) {
		case REHYDRATE:
			return {
				showHint: false
			};
		case 'SHOW_HINT':
			return {
				...state,
				showHint: true,
				hintText: action.hintText,
				hintType: action.hintType
			};
		case 'HIDE_HINT':
			return {
				...state,
				showHint: false
			};
		default:
			return state;
	}
};
export default alertReducer;
