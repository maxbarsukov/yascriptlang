import Parser from '../../parser/Parser.js';
import InputStream from '../../tokenizer/InputStream.js';
import TokenStream from '../../tokenizer/TokenStream.js';

export default function stdEnv(ast) {
  const std = `def cons = fn(a, b) -> fn(f) -> f(a, b);
def car = fn(cell) -> cell(fn(a, b) -> a);
def cdr = fn(cell) -> cell(fn(a, b) -> b);
def NIL = fn(f) -> f(NIL, NIL);
def not = fn(x) -> if x then false else true;

def foreach = fn(list, f) ->
  if list != NIL {
    f(car(list));
    foreach(cdr(list), f);
  };

def range = fn(a, b) ->
  if a <= b then cons(a, range(a + 1, b))
  else NIL;
  `;
  const inputStream = new InputStream(std);
  const tokenStream = new TokenStream(inputStream);
  const parser = new Parser(tokenStream);

  const stdAst = parser.parse();
  ast.prog = [...stdAst.prog, ...ast.prog];
  return ast;
}
