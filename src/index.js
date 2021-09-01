import Parser from './parser/Parser.js';
import InputStream from './tokenizer/InputStream.js';
import TokenStream from './tokenizer/TokenStream.js';

import evaluate from './runtime/Evaluator.js';
import Executor from './runtime/Executor.js';

import makeEnv from './stdlib/StdEnvJS.js';
import stdEnv from './stdlib/StdEnvYAS.js';
import makeCompilerEnv from './stdlib/StdCompilerEnv.js';

import CompilerJS from './codegen/CompilerJS.js';

export function run(code, callback) {
  const inputStream = new InputStream(code);
  const tokenStream = new TokenStream(inputStream);
  const parser = new Parser(tokenStream);

  const ast = parser.parse();
  const globalEnv = makeEnv();

  Executor.execute(evaluate, [stdEnv(ast), globalEnv, callback]);
}

export function compile(code) {
  const inputStream = new InputStream(code);
  const tokenStream = new TokenStream(inputStream);
  const parser = new Parser(tokenStream);
  const ast = parser.parse();
  makeCompilerEnv();
  const compiler = new CompilerJS(stdEnv(ast));
  return compiler.compile();
}

export function runJS(jsCode) {
  eval(jsCode);
}
