module.exports = class P {
	apply(compiler) {
		compiler.hooks.emit.tap('emit', function() {
			console.log(this)
		});
	}
}