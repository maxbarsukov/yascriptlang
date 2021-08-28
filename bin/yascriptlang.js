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

const code = `
fib = lambda (n) if n < 2 then n else fib(n - 1) + fib(n - 2);

println(fib(15));
`

const inputStream = new InputStream(code);
const tokenStream = new TokenStream(inputStream);
const parser = new Parser(tokenStream);

const ast = parser.parse();
const globalEnv = new Environment();

globalEnv.def("println", function(val){
  console.log(val + "\n");
});

globalEnv.def("print", function(val){
  process.stdout.write(val.toString());
});
Evaluator.evaluate(ast, globalEnv);
