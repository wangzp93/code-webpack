// 同步插件
module.exports = class DownPlugin {
	// 每个plugin里都有个apply方法
	apply(compiler) {	// compiler为webpack实例
		// 一般第一个参数是插件名字，第二个是回调函数
		compiler.hooks.done.tap('DownPlugin', function(stats) {
			console.log('编译完成')
		});
	}
}