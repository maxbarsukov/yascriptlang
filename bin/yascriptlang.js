#!/usr/bin/env node

import Yascriptlang from '../src/index.js'

const {
  Parser,
  InputStream,
  TokenStream,
  Environment,
  evaluate,
  Executor,
} = Yascriptlang;

const args = process.argv.splice(process.execArgv.length + 2);

const code = `
fib = lambda(n) if n < 2 then n else fib(n - 1) + fib(n - 2);
time(lambda() println(fib(20)));
`

const inputStream = new InputStream(code);
const tokenStream = new TokenStream(inputStream);
const parser = new Parser(tokenStream);

const ast = parser.parse();
const globalEnv = new Environment();

globalEnv.def("print", function(callback, txt){
  process.stdout.write(txt.toString());
  callback(false);
});

globalEnv.def("println", function(callback, txt){
  console.log(txt);
  callback(false);
});

globalEnv.def("time", function(callback, func){
  console.time("time");
  func(function(ret){
    console.timeEnd("time");
    callback(ret);
  });
});

Executor.execute(evaluate, [ ast, globalEnv, result => {
  console.log("Result: ", result);
}]);
