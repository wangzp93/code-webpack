module.exports = function(source) {
	let styleStr = `
		let style = document.createElement('style');
		style.innerText = ${JSON.stringify(source)};
		document.head.appendChild(style);
	`;
	return styleStr;
}