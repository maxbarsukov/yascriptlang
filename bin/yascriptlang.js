#!/usr/bin/env node

import Yascriptlang from '../src/index.js'

const args = process.argv.splice(process.execArgv.length + 2);

const code = '1 + 2'

const inputStream = new Yascriptlang.InputStream(code);
const tokenStream = new Yascriptlang.TokenStream(inputStream);
const parser = new Yascriptlang.Parser(tokenStream);

const ast = parser.parse();

console.log(ast);
