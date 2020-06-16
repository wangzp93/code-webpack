#! /usr/bin/evn node

// 1. 找到当前执行名的路径，拿到webpack.conf.js

const path = require('path');

// config配置文件
const config = require('./webpack.config.js');

let Compiler = require('./lib/Compiler.js');
let compiler = new Compiler(config);
// 触发钩子函数
compiler.hooks.entryOption.call();

// 运行编译
compiler.run();