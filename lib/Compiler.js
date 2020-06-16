const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generator = require('@babel/generator').default;
const ejs = require('ejs');
const {
	Tapable,
	SyncHook,
	SyncBailHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable");

/**
 * 编译过程需要一些依赖包
 * npm install --save-dev babylon @babel/traverse @babel/types @babel/generator ejs tapable
 * 
 * babylon 主要是把源码，转换成AST
 * @babel/traverse
 * @babel/types
 * @babel/generator
 * ejs 模板解析
 * tapable 发布订阅模式
 */
class Compiler {
	constructor(config) {
		// entry output
	    this.config = config;
		// 保存入口文件的路径
		this.entryId;	// ./src/index.js
		// 保存所有模块的依赖
		this.modules = {};
		
		this.entry = config.entry;	// 入口路径
		this.root = process.cwd();	// 命令执行时的路径
		
		this.hooks = {
			entryOption: new SyncHook(),
			compile: new SyncHook(),
			afterCompile: new SyncHook(),
			afterPlugins: new SyncHook(),
			run: new SyncHook(),
			emit: new AsyncSeriesHook(["compilation"]),
			done: new SyncHook()
		};
		// 如果传递了plugins参数
		let plugins = config.plugins || [];
		this.plugins = plugins;
		for (let i=0, len=plugins.length; i<len; i++) {
			// 这里的apply不是改变this，是注册钩子函数的意思
			plugins[i].apply(this);
		}
		this.hooks.afterPlugins.call();
	}
	run() {
		// 触发钩子函数
		this.hooks.run.call();
		this.hooks.compile.call();
		// 执行 并创建模块依赖关系
		this.buildModule(path.resolve(this.root, this.entry), true);	// true代表主模块
		// 触发钩子函数
		this.hooks.afterCompile.call();
		// 打包后的文件
		this.emitFile();
		// 触发钩子函数
		this.hooks.emit.callAsync();
		this.hooks.done.call();
	}
	// 构建模块
	buildModule(modulePath, isEntry) {
		// 拿到模块内容
		let source = this.getSource(modulePath);
		// 模块id modulePath = modulePath - this.root
		// 个人感觉 就是this.entry
		let moduleName = './' + path.relative(this.root, modulePath);
		if (isEntry) {
			this.entryId = moduleName;	// 保存入口的名字
		}
		// 解析，需要把source源码改造，返回一个依赖列表
		let { sourceCode, dependencies } = this.parse(source, path.dirname(moduleName));	// path.dirname(moduleName): ./src
		// 把相对路径和模块中的内容对应起来
		this.modules[moduleName] = sourceCode;
		
		// 递归构建
		for (let i=0, len=dependencies.length; i<len; i++) {
			let dep = dependencies[i];
			this.buildModule(path.join(this.root, dep), false);
		}
	}
	// 读取源码
	getSource(modulePath) {
		let content = fs.readFileSync(modulePath, 'utf8');
		// 根据loader处理
		let rules = this.config.module.rules;
		for (let i=0, len=rules.length; i<len; i++) {
			let rule = rules[i];
			let { test, use } = rule;
			if (test.test(modulePath)) {	// 匹配成功，需要loader
				for (let j=use.length-1; j>=0; j--) {
					// 从后向前获取loader
					let loader = require(use[j]);
					content = loader(content);
				}
			}
		}
		return content;
	}
	// 解析源码
	parse(source, parentPath) {	// AST解析语法树
		let ast = babylon.parse(source);
		let dependencies = [];	// 依赖的数组
		traverse(ast, {
			CallExpression(p) {
				let node = p.node;	// 对应的节点
				if (node.callee.name === 'require') {
					node.callee.name = '__webpack_require__';
					let moduleName = node.arguments[0].value;	// 取到的就是模块的引用名字
					moduleName += (path.extname(moduleName)?'':'.js');	// 找扩展名
					moduleName = './' + path.join(parentPath, moduleName);		// ./src/a.js
					dependencies.push(moduleName);
					node.arguments = [t.stringLiteral(moduleName)];
				}
			}
		});
		let sourceCode = generator(ast).code;
		return { sourceCode, dependencies };
	}
	// 打包后的文件
	emitFile() {
		let output = this.config.output;
		// 输出路径
		let main = path.join(output.path, output.filename);
		// 获取模板
		let templateStr = this.getSource(path.join(__dirname, 'main.ejs'));
		let code = ejs.render(templateStr, {
			entryId: this.entryId,
			modules: this.modules
		});
		this.assets = {};
		// 资源中 路径对应的代码
		this.assets[main] = code;
		fs.writeFileSync(main, this.assets[main]);
	}
}
module.exports = Compiler;