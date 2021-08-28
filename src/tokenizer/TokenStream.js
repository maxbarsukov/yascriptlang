import TokenTypes from './TokenTypes.js';
import Keywords from './Keywords.js';

class TokenStream {
  constructor(input) {
    this.input = input;
    this.current = null;
    this.keywords = Object.values(Keywords);
  }

  isKeyword(x) {
    return this.keywords.includes(x);
  }

  isDigit(ch) {
    return /[0-9]/i.test(ch);
  }

  isIdStart(ch) {
    return /[a-zλ_]/i.test(ch);
  }

  isId(ch) {
    return this.isIdStart(ch) || '?!-<>=0123456789'.includes(ch);
  }

  isOpChar(ch) {
    return '+-*/%=&|<>!'.includes(ch);
  }

  isPunc(ch) {
    return ',;(){}[]'.includes(ch);
  }

  isWhitespace(ch) {
    return ' \t\n'.includes(ch);
  }

  readWhile(predicate) {
    let str = '';
    while (!this.input.eof() && predicate(this.input.peek())) str += this.input.next();
    return str;
  }

  readNumber() {
    let hasDot = false;
    const number = this.readWhile(ch => {
      if (ch === '.') {
        if (hasDot) return false;
        hasDot = true;
        return true;
      }
      return this.isDigit(ch);
    });
    return {
      type: TokenTypes.NUM,
      value: parseFloat(number),
    };
  }

  readIdent() {
    const id = this.readWhile(this.isId);
    return {
      type: this.isKeyword(id) ? TokenTypes.KEYWORD : TokenTypes.VAR,
      value: id,
    };
  }

  readEscaped(end) {
    let escaped = false;
    let str = '';
    this.input.next();
    while (!this.input.eof()) {
      const ch = this.input.next();
      if (escaped) {
        str += ch;
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
    return {
      type: TokenTypes.STR,
      value: this.readEscaped('"'),
    };
  }

  skipComment() {
    this.readWhile(ch => ch !== '\n');
    this.input.next();
  }

  readNext() {
    this.readWhile(this.isWhitespace);
    if (this.input.eof()) return null;

    const ch = this.input.peek();
    if (ch === '#') {
      this.skipComment();
      return this.readNext();
    }

    if (ch === '"') return this.readString();
    if (this.isDigit(ch)) return this.readNumber();
    if (this.isIdStart(ch)) return this.readIdent();
    if (this.isPunc(ch)) {
      return {
        type: TokenTypes.PUNC,
        value: this.input.next(),
      };
    }
    if (this.isOpChar(ch)) {
      return {
        type: TokenTypes.OP,
        value: this.readWhile(this.isOpChar),
      };
    }
    return this.input.croak(`Can't handle character: ${ch}`);
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
}

export default TokenStream;
