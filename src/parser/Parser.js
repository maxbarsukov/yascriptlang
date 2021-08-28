import NodeTypes from './NodeTypes.js';
import TokenTypes from '../tokenizer/TokenTypes.js';
import Keywords from '../tokenizer/Keywords.js';

class Parser {
  constructor(input) {
    this.tokens = input;
    this.PRECEDENCE = {
      '=': 1,
      '||': 2,
      '&&': 3,
      '<': 7,
      '>': 7,
      '<=': 7,
      '>=': 7,
      '==': 7,
      '!=': 7,
      '+': 10,
      '-': 10,
      '*': 20,
      '/': 20,
      '%': 20,
    };
    this.FALSE = {
      type: NodeTypes.BOOL,
      value: false,
    };
  }

  parse() {
    return this.parseToplevel();
  }

  isPunc(ch) {
    const tok = this.tokens.peek();
    return tok && tok.type === TokenTypes.PUNC && (!ch || tok.value === ch) && tok;
  }

  isKeyword(kw) {
    const tok = this.tokens.peek();
    return tok && tok.type === TokenTypes.KEYWORD && (!kw || tok.value === kw) && tok;
  }

  isOp(op) {
    const tok = this.tokens.peek();
    return tok && tok.type === TokenTypes.OP && (!op || tok.value === op) && tok;
  }

  skipPunc(ch) {
    if (this.isPunc(ch)) this.tokens.next();
    else this.tokens.croak(`Expecting punctuation: "${ch}"`);
  }

  skipKeyword(kw) {
    if (this.isKeyword(kw)) this.tokens.next();
    else this.tokens.croak(`Expecting keyword: "${kw}"`);
  }

  skipOp(op) {
    if (this.isOp(op)) this.tokens.next();
    else this.tokens.croak(`Expecting operator: "${op}"`);
  }

  unexpected() {
    this.tokens.croak(`Unexpected token: ${JSON.stringify(this.tokens.peek())}`);
  }

  maybeBinary(left, myPrec) {
    const tok = this.isOp();
    if (tok) {
      const hisPrec = this.PRECEDENCE[tok.value];
      if (hisPrec > myPrec) {
        this.tokens.next();
        return this.maybeBinary(
          {
            type: tok.value === '=' ? NodeTypes.ASSIGN : NodeTypes.BINARY,
            operator: tok.value,
            left,
            right: this.maybeBinary(this.parseAtom(), hisPrec),
          },
          myPrec
        );
      }
    }
    return left;
  }

  delimited(start, stop, separator, parser) {
    const a = [];
    let first = true;
    this.skipPunc(start);
    while (!this.tokens.eof()) {
      if (this.isPunc(stop)) break;
      if (first) first = false;
      else this.skipPunc(separator);
      if (this.isPunc(stop)) break;
      a.push(parser());
    }
    this.skipPunc(stop);
    return a;
  }

  parseCall(func) {
    return {
      type: NodeTypes.CALL,
      func,
      args: this.delimited('(', ')', ',', this.parseExpression.bind(this)),
    };
  }

  parseVarname() {
    const name = this.tokens.next();
    if (name.type !== TokenTypes.VAR) this.tokens.croak('Expecting variable name');
    return name.value;
  }

  parseIf() {
    this.skipKeyword(Keywords.IF);
    const cond = this.parseExpression();
    if (!this.isPunc('{')) this.skipKeyword(Keywords.THEN);
    const then = this.parseExpression();
    const ret = {
      type: NodeTypes.IF,
      cond,
      then,
    };
    if (this.isKeyword(Keywords.ELSE)) {
      this.tokens.next();
      ret.else = this.parseExpression();
    }
    return ret;
  }

  parseLambda() {
    return {
      type: NodeTypes.LAMBDA,
      vars: this.delimited('(', ')', ',', this.parseVarname.bind(this)),
      body: this.parseExpression(),
    };
  }

  parseBool() {
    return {
      type: NodeTypes.BOOL,
      value: this.tokens.next().value === Keywords.TRUE,
    };
  }

  maybeCall(expr) {
    expr = expr();
    return this.isPunc('(') ? this.parseCall(expr) : expr;
  }

  parseAtom() {
    return this.maybeCall(() => {
      if (this.isPunc('(')) {
        this.tokens.next();
        const exp = this.parseExpression();
        this.skipPunc(')');
        return exp;
      }
      if (this.isPunc('{')) return this.parseProg();
      if (this.isKeyword(Keywords.IF)) return this.parseIf();
      if (this.isKeyword(Keywords.TRUE) || this.isKeyword(Keywords.FALSE)) return this.parseBool();
      if (this.isKeyword(Keywords.LAMBDA)) {
        this.tokens.next();
        return this.parseLambda();
      }
      const tok = this.tokens.next();
      if (tok.type === TokenTypes.VAR
        || tok.type === TokenTypes.NUM
        || tok.type === TokenTypes.STR) {
        return tok;
      }
      return this.unexpected();
    });
  }

  parseToplevel() {
    const prog = [];
    while (!this.tokens.eof()) {
      prog.push(this.parseExpression());
      if (!this.tokens.eof()) this.skipPunc(';');
    }
    return {
      type: NodeTypes.PROG,
      prog,
    };
  }

  parseProg() {
    const prog = this.delimited('{', '}', ';', this.parseExpression.bind(this));
    if (prog.length === 0) return this.FALSE;
    if (prog.length === 1) return prog[0];
    return {
      type: NodeTypes.PROG,
      prog,
    };
  }

  parseExpression() {
    return this.maybeCall(() => this.maybeBinary(this.parseAtom(), 0));
  }
}

export default Parser;
