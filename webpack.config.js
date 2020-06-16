const path = require('path');
const webpack = require('webpack');
const DownPlugin = require('./plugins/down-plugin.js');
const AsyncPlugin = require('./plugins/async-plugin.js');
const FileListPlugin = require('./plugins/file-list-plugin.js');

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [{
			test: /\.js$/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: '@babel/preset-env'
				}
			}
		}, {
			test: /\.less$/,
			use: [
				path.resolve(__dirname, 'loaders', 'style-loader'),
				path.resolve(__dirname, 'loaders', 'less-loader')
			]
		}]
	},
	plugins: [
		new DownPlugin(),
		new AsyncPlugin(),
		new FileListPlugin({
			filename: 'list.md'
		})
	]
}