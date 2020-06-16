const babel = require('@babel/core');
const loaderUtils = require('loader-utils');

function loader(source) {
	let options = loaderUtils.getOptions(this);	// 解析option用
	let cb = this.asycn();	// 内置的异步处理，返回一个回调函数
	babel.transform(source, {
		...options,
		sourceMap: true,
		filename: this.resourcePath.split('/').pop()		// 文件名
	}, function(err, result) {
		cb(err, result.code, result.map);	// 异步处理
	});
	// return source;
}
module.exports = loader;