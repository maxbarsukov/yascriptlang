import Parser from './parser/Parser.js';
import InputStream from './tokenizer/InputStream.js';
import TokenStream from './tokenizer/TokenStream.js';

import Evaluator from './runtime/Evaluator.js';
import Environment from './runtime/Environment.js';

const Yascriptlang = {
  Parser,
  InputStream,
  TokenStream,
  Environment,
  Evaluator,
}

export default Yascriptlang;
