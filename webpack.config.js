const path = require('path');
const webpack = require('webpack');
const P = require('./plugins/p.js');

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [{
			test: /\.less$/,
			use: [
				path.resolve(__dirname, 'loader', 'style-loader'),
				path.resolve(__dirname, 'loader', 'less-loader')
			]
		}]
	},
	plugins: [
		new P()
	]
}