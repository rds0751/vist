export function toggleShowHint(hintText, hintType = 'success') {
	return {
		type: 'SHOW_HINT',
		hintText,
		hintType
	};
}

export function toggleHideHint() {
	return {
		type: 'HIDE_HINT'
	};
}
