import TokenTypes from './TokenTypes.js';

import TokenStreamHelper from './TokenStreamHelper.js';

class TokenStream {
  constructor(input) {
    this.input = input;
    this.current = null;
  }

  readWhile(predicate) {
    let str = '';
    while (!this.input.eof() && predicate(this.input.peek(), this.input.peek(1))) {
      str += this.input.next().value;
    }
    return str;
  }

  readComment() {
    const next = this.input.next();
    let variant;
    if (next.value === '/') {
      this.input.next();
      variant = '//';
    } else {
      variant = '#';
    }
    const value = this.readWhile((ch) => ch !== '\n');
    return {
      type: TokenTypes.COMMENT,
      variant,
      value,
      line: next.line,
      col: next.col,
    };
  }

  readMultilineComment() {
    const next = this.input.next();
    this.input.next();
    const value = this.readWhile((ch1, ch2) => ch1 !== '*' && ch2 !== '/');
    this.input.next();
    this.input.next();
    return {
      type: TokenTypes.COMMENT,
      variant: 'multiline',
      value,
      line: next.line,
      col: next.col,
    };
  }

  readEscaped(end) {
    let escaped = false;
    let str = '';
    while (!this.input.eof()) {
      const next = this.input.next();
      const ch = next.value;

      if (escaped) {
        if (ch === 'n') {
          str += '\n';
        } else {
          str += ch;
        }
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === end) {
        break;
      } else {
        str += ch;
      }
    }
    return str;
  }

  readString() {
    const next = this.input.next();
    const variant = next.value === "'" ? "'" : '"';
    const value = this.readEscaped(variant);
    return {
      type: TokenTypes.STR,
      variant,
      value,
      line: next.line,
      col: next.col,
    };
  }

  readNumber() {
    const next = this.input.peekData();
    let hasDot = false;
    const number = this.readWhile((ch) => {
      if (ch === '.') {
        if (hasDot) return false;
        hasDot = true;
        return true;
      }
      return TokenStreamHelper.isDigit(ch);
    });
    return {
      type: TokenTypes.NUM,
      value: parseFloat(number),
      line: next.line,
      col: next.col,
    };
  }

  readIdent() {
    const next = this.input.peekData();
    const id = this.readWhile(TokenStreamHelper.isId.bind(this));
    return {
      type: TokenStreamHelper.isKeyword(id) ? TokenTypes.KEYWORD : TokenTypes.VAR,
      value: id,
      line: next.line,
      col: next.col,
    };
  }

  readPunc() {
    const next = this.input.next();
    return {
      type: TokenTypes.PUNC,
      value: next.value,
      line: next.line,
      col: next.col,
    };
  }

  readOp() {
    const next = this.input.peekData();
    return {
      type: TokenTypes.OP,
      value: this.readWhile(TokenStreamHelper.isOpChar),
      line: next.line,
      col: next.col,
    };
  }

  readMod() {
    const next = this.input.next();
    return {
      type: TokenTypes.MOD,
      value: next.value,
      line: next.line,
      col: next.col,
    };
  }

  readNext() {
    this.readWhile(TokenStreamHelper.isWhitespace);
    if (this.input.eof()) return null;

    const ch = this.input.peek();
    const next = this.input.peek(1);
    if (ch === '#') {
      this.readComment();
      return this.readNext();
    }
    if (ch === '/' && next === '*') {
      this.readMultilineComment();
      return this.readNext();
    }
    if (ch === '/' && next === '/') {
      this.readComment();
      return this.readNext();
    }
    if (ch === "'" || ch === '"') return this.readString();
    if (TokenStreamHelper.isDigit(ch)) return this.readNumber();
    if (TokenStreamHelper.isIdStart(ch) || (ch === '-' && next === '>')) return this.readIdent();
    if (TokenStreamHelper.isPunc(ch)) return this.readPunc();
    if (TokenStreamHelper.isOpChar(ch)) return this.readOp();
    if (ch === '?') return this.readMod();
    return this.croak('Lexing Error', `Can't handle character: "${ch}"`);
  }

  peek() {
    if (!this.current) {
      this.current = this.readNext();
    }
    return this.current;
  }

  next() {
    const tok = this.current;
    this.current = null;
    return tok || this.readNext();
  }

  eof() {
    return this.peek() == null;
  }

  croak(type, msg) {
    return this.input.croak(type, msg);
  }
}

export default TokenStream;
