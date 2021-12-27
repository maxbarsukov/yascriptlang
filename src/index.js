import UglifyJS from 'uglify-js';

import Parser from './parser/Parser.js';
import InputStream from './tokenizer/InputStream.js';
import TokenStream from './tokenizer/TokenStream.js';

import evaluate from './runtime/Evaluator.js';
import Executor from './runtime/Executor.js';

import makeEnv from './stdlib/interpreter/StdEnvJS.js';
import stdEnv from './stdlib/interpreter/StdEnvYAS.js';

import makeCompilerEnv from './stdlib/compiler/StdCompilerEnv.js';

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
  const compiler = new CompilerJS(stdEnv(ast));
  const js = makeCompilerEnv() + compiler.compile();

  const uglified = UglifyJS.minify(js);
  if (uglified.error) {
    throw EvalError(`Comppiling Error: ${uglified.error}`);
  } else {
    return uglified.code;
  }
}

export function runJS(jsCode) {
  eval(jsCode);
}
