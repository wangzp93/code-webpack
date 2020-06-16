// 异步插件
module.exports = class AsyncPlugin {
	apply(compiler) {
		compiler.hooks.emit.tapAsync('AsyncPlugin', function(compilation, cb) {
			setTimeout(function() {
				console.log('我是异步，文件输出了，等一下');
				cb();
			}, 1000);
		});
		compiler.hooks.emit.tapPromise('AsyncPlugin', function(compilation) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					console.log('我是Promise，在等一秒');
					resolve();
				}, 1000);
			});
		});
	}
}