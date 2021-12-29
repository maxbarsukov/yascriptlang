import NodeTypes from './NodeTypes.js';
import TokenTypes from '../tokenizer/TokenTypes.js';
import Keywords from '../tokenizer/Keywords.js';

class Parser {
  constructor(input) {
    this.tokens = input;
    this.PRECEDENCE = {
      '=': 1,
      '*=': 1,
      '**=': 1,
      '/=': 1,
      '+=': 1,
      '-=': 1,
      '||': 2,
      '&&': 3,
      '<': 7,
      '>': 7,
      '<=': 7,
      '>=': 7,
      '==': 7,
      '!=': 7,
      '+': 10,
      '++': 10,
      '-': 10,
      '*': 20,
      '/': 20,
      '%': 20,
      '**': 30,
      '|>': 40,
    };
    this.FALSE = {
      type: NodeTypes.BOOL,
      value: false,
    };

    this.is = (type) => (ch) => {
      const tok = this.tokens.peek();
      return tok && tok.type === type && (!ch || tok.value === ch) && tok;
    };

    this.skip = (type) => (ch) => {
      if (this.is(type)(ch)) {
        this.tokens.next();
      } else {
        this.tokens.croak('Parse Error', `Expecting ${type}: "${ch}"`);
      }
    };

    this.isPunc = this.is(TokenTypes.PUNC);
    this.isKeyword = this.is(TokenTypes.KEYWORD);
    this.isOp = this.is(TokenTypes.OP);
    this.isVar = this.is(TokenTypes.VAR);

    this.skipPunc = this.skip(TokenTypes.PUNC);
    this.skipKeyword = this.skip(TokenTypes.KEYWORD);
    this.skipOp = this.skip(TokenTypes.OP);
    this.skipVar = this.skip(TokenTypes.VAR);
  }

  parse() {
    return this.parseToplevel();
  }

  unexpected(token) {
    this.tokens.croak('Parse Error', `Unexpected token: ${JSON.stringify(token)}`);
  }

  maybeBinary(left, myPrec) {
    const tok = this.isOp();
    if (tok) {
      const hisPrec = this.PRECEDENCE[tok.value];
      if (hisPrec > myPrec) {
        this.tokens.next();
        const assigns = ['=', '*=', '**=', '+=', '-=', '/='];
        const type = assigns.includes(tok.value) ? NodeTypes.ASSIGN : NodeTypes.BINARY;
        return this.maybeBinary(
          {
            type,
            operator: tok.value,
            left,
            right: this.maybeBinary(this.parseAtom(), hisPrec),
            line: left.line,
            col: left.col,
          },
          myPrec
        );
      }
    }
    return left;
  }

  maybePipe(expr) {
    if (expr.type === NodeTypes.BINARY && expr.operator === '|>') {
      const { left } = expr;
      const { right } = expr;
      if (right.type === NodeTypes.VAR || right.type === NodeTypes.FN) {
        return {
          type: NodeTypes.CALL,
          func: right,
          line: right.line,
          col: right.col,
          args: [this.maybePipe(left)],
        };
      }
      if (right.type === NodeTypes.CALL) {
        return {
          type: NodeTypes.CALL,
          func: {
            value: right.func.value,
            type: NodeTypes.VAR,
            line: right.func.line,
            col: right.func.col,
          },
          line: right.line,
          col: right.col,
          args: [left, ...right.args],
        };
      }
      this.tokens.croak('Parse Error', "Expected call or variable after '|>'");
    }
    return expr;
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
    const peek = this.tokens.peek();
    return {
      type: NodeTypes.CALL,
      func,
      line: peek.line,
      col: peek.col,
      args: this.delimited('(', ')', ',', this.parseExpression.bind(this)),
    };
  }

  parseNot() {
    const next = this.tokens.next();
    return {
      type: NodeTypes.NOT,
      value: this.parseExpression(),
      line: next.line,
      col: next.col,
    };
  }

  parseVarname() {
    let name = this.tokens.next();
    let mod = '';
    let immutable = true;
    if (name.type === TokenTypes.MOD) {
      mod = '?';
      name = this.tokens.next();
    }
    if (name.type === TokenTypes.KEYWORD && name.value === TokenTypes.MUT) {
      immutable = false;
      name = this.tokens.next();
    }
    if (name.type !== TokenTypes.VAR) {
      this.tokens.croak('Parse Error', 'Expecting variable name');
    }
    return {
      value: name.value,
      mod,
      immutable,
      line: name.line,
      col: name.col,
    };
  }

  parseIf() {
    const peek = this.tokens.peek();
    this.skipKeyword(Keywords.IF);
    const cond = this.parseExpression();
    if (!this.isPunc('{')) this.skipKeyword(Keywords.THEN);
    const then = this.parseExpression();
    const ret = {
      type: NodeTypes.IF,
      cond,
      then,
      line: peek.line,
      col: peek.col,
    };
    if (this.isKeyword(Keywords.ELSE)) {
      this.tokens.next();
      ret.else = this.parseExpression();
    }
    return ret;
  }

  parseFn() {
    const next = this.tokens.next();
    let vars;
    let name;
    if (next.value === Keywords.FN) {
      if (this.tokens.peek().type === NodeTypes.VAR) {
        name = this.tokens.next();
      }
      vars = this.delimited('(', ')', ',', this.parseVarname.bind(this));
      this.skipKeyword(Keywords.ARROW);
    } else {
      vars = [];
      name = null;
    }
    return {
      type: NodeTypes.FN,
      name,
      vars,
      body: this.parseExpression(),
      line: next.line,
      col: next.col,
    };
  }

  parseBool() {
    const next = this.tokens.next();
    return {
      type: NodeTypes.BOOL,
      value: next.value === Keywords.TRUE,
      line: next.line,
      col: next.col,
    };
  }

  maybeCall(expr) {
    expr = expr();
    return this.isPunc('(') ? this.parseCall(expr) : expr;
  }

  parseLet() {
    this.skipKeyword(Keywords.LET);
    const peek = this.tokens.peek();
    if (peek.type === TokenTypes.VAR) {
      const name = this.tokens.next().value;
      const defs = this.delimited('(', ')', ',', this.parseVardef.bind(this));
      this.skipKeyword(Keywords.ARROW);
      return {
        type: NodeTypes.CALL,
        func: {
          type: NodeTypes.FN,
          name,
          vars: defs.map((def) => def.name),
          body: this.parseExpression(),
        },
        args: defs.map((def) => def.def || this.FALSE),
        line: peek.line,
        col: peek.col,
      };
    }
    const vars = this.delimited('(', ')', ',', this.parseVardef.bind(this));
    this.skipKeyword(Keywords.ARROW);
    return {
      type: NodeTypes.LET,
      vars,
      body: this.parseExpression(),
      line: peek.line,
      col: peek.col,
    };
  }

  parseVardef() {
    const peek = this.tokens.peek();
    const name = this.parseVarname();
    let def;
    if (this.isOp('=')) {
      this.skipOp('=');
      def = this.parseExpression();
    }
    return {
      name,
      def,
      line: peek.line,
      col: peek.col,
    };
  }

  parseDefine() {
    const next = this.tokens.next();
    let variant = 'immutable';
    if (this.isKeyword(Keywords.MUT)) {
      variant = 'mutable';
      this.skipKeyword(Keywords.MUT);
    }
    const left = this.isVar();
    if (left) {
      this.skipVar(left.value);
    } else {
      this.tokens.croak(
        'Parse Error',
        `Expecting variable name after ${variant === 'immutable' ? 'def' : 'def mut'}`
      );
    }
    let right = {
      type: NodeTypes.NUM,
      value: 0,
    };
    if (this.isOp('=')) {
      this.skipOp('=');
      right = this.parseExpression();
    }
    return {
      type: NodeTypes.DEFINE,
      variant,
      left,
      right,
      line: next.line,
      col: next.col,
    };
  }

  parseRaw() {
    this.skipKeyword(Keywords._JS_);
    if (this.tokens.peek().type !== NodeTypes.STR) {
      this.tokens.croak(
        'Parse Error',
        '_JS_ raw code must be a plain string'
      );
    }
    return {
      type: NodeTypes._JS_,
      code: this.tokens.next().value,
    };
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
      if (this.isOp('!')) return this.parseNot();
      if (this.isKeyword(Keywords.IF)) return this.parseIf();
      if (this.isKeyword(Keywords.TRUE) || this.isKeyword(Keywords.FALSE)) return this.parseBool();
      if (this.isKeyword(Keywords.FN) || this.isKeyword(Keywords.FN_ARROW)) return this.parseFn();
      if (this.isKeyword(Keywords.DEF)) return this.parseDefine();
      if (this.isKeyword(Keywords.LET)) return this.parseLet();
      if (this.isKeyword(Keywords._JS_)) return this.parseRaw();
      const tok = this.tokens.next();
      if (
        tok.type === TokenTypes.VAR
        || tok.type === TokenTypes.NUM
        || tok.type === TokenTypes.STR
      ) {
        return tok;
      }
      return this.unexpected();
    });
  }

  parseToplevel() {
    const prog = [];
    const peek = this.tokens.peek();
    while (!this.tokens.eof()) {
      prog.push(this.parseExpression());
      if (!this.tokens.eof()) this.skipPunc(';');
    }
    return {
      type: NodeTypes.PROG,
      prog,
      global: true,
      line: peek.line,
      col: peek.col,
    };
  }

  parseProg() {
    const peek = this.tokens.peek();
    const prog = this.delimited('{', '}', ';', this.parseExpression.bind(this));
    if (prog.length === 0) return this.FALSE;
    if (prog.length === 1) return prog[0];
    return {
      type: NodeTypes.PROG,
      prog,
      line: peek.line,
      col: peek.col,
    };
  }

  parseExpression() {
    return this.maybePipe((() => this.maybeCall(() => this.maybeBinary(this.parseAtom(), 0)))());
  }
}

export default Parser;
