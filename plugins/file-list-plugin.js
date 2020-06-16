module.exports = class FileListPlugin {
	constructor(arg) {
	    this.filename = arg.filename;
	}
	apply(compiler) {
		// 文件已经准备好了，要进行输出
		// emit
		compiler.hooks.emit.tapAsync('FileListPlugin', (compilation)=> {
			console.log('输出compilation----------------');
			console.log(compilation);
		});
	}
}