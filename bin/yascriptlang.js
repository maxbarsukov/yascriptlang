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
println(let loop (n = 100)
          if n > 0 then n + loop(n - 1)
                   else 0);

let (x = 2, y = x + 1, z = x + y)
  println(x + y + z);

# errors out, the vars are bound to the let body
# print(x + y + z);

let (x = 10) {
  let (x = x * 2, y = x * x) {
    println(x);  ## 20
    println(y);  ## 400
  };
  println(x);  ## 10
};
`

const inputStream = new InputStream(code);
const tokenStream = new TokenStream(inputStream);
const parser = new Parser(tokenStream);

const ast = parser.parse();
const globalEnv = new Environment();

globalEnv.def("println", function(val){
  console.log(val);
});

globalEnv.def("print", function(val){
  process.stdout.write(val.toString());
});
Evaluator.evaluate(ast, globalEnv);
