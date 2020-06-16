const less = require('less');

module.exports = function(source) {
	let cssStr = '';
	less.render(source, function(err, c) {
		cssStr = c.css;
	});
	cssStr = cssStr.replace(/\n/g, '\\n');	// 换行符需要转一下
	return cssStr;
}