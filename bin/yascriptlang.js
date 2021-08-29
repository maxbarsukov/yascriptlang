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
with-return = lambda(f) lambda() call-cc(f);

foo = with-return(lambda(return){
  println("foo");
  return("DONE");
  println("bar");
});

foo();
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

globalEnv.def("call-cc", function CallCC(callback, func){
  Executor.guard(CallCC, arguments);
  func(callback, function curCont(discarded, ret){
    Executor.guard(curCont, arguments);
    callback(ret);
  });
});

Executor.execute(evaluate, [ ast, globalEnv, result => {
  console.log("Result: ", result);
}]);
