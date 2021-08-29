import Parser from './parser/Parser.js';
import InputStream from './tokenizer/InputStream.js';
import TokenStream from './tokenizer/TokenStream.js';

import evaluate from './runtime/Evaluator.js';
import Environment from './runtime/Environment.js';
import Executor from './runtime/Executor.js';

const Yascriptlang = {
  Parser,
  InputStream,
  TokenStream,
  Environment,
  evaluate,
  Executor,
}

export default Yascriptlang;
