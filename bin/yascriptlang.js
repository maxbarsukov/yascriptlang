#!/usr/bin/env node

import Yascriptlang from '../src/index.js'

const {
  Parser,
  InputStream,
  TokenStream,
  Environment,
  Evaluator,
} = Yascriptlang;

const args = process.argv.splice(process.execArgv.length + 2);

const code = 'print(2 + 2);'

const inputStream = new InputStream(code);
const tokenStream = new Yascriptlang.TokenStream(inputStream);
const parser = new Yascriptlang.Parser(tokenStream);

const ast = parser.parse();
const globalEnv = new Environment();

globalEnv.def("print", function(txt){
  console.log(txt);
});

Evaluator.evaluate(ast, globalEnv);
