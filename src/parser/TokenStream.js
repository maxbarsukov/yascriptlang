import TokenTypes from './TokenTypes'

class TokenStream {
  constructor(input) {
    this.input = input;
    this.current = null;
    this.keywords = [
      'if',
      'then',
      'else',
      'lambda',
      'true',
      'false',
    ]
  }

  is_keyword(x) {
    return this.keywords.includes(x);
  }

  is_digit(ch) {
    return /[0-9]/i.test(ch);
  }

  is_id_start(ch) {
    return /[a-zλ_]/i.test(ch);
  }

  is_id(ch) {
    return this.is_id_start(ch) || '?!-<>=0123456789'.includes(ch);
  }

  is_op_char(ch) {
    return '+-*/%=&|<>!'.includes(ch);
  }

  is_punc(ch) {
    return ',;(){}[]'.includes(ch);
  }

  is_whitespace(ch) {
    return ' \t\n'.includes(ch);
  }

  read_while(predicate) {
    let str = '';
    while (!this.input.eof() && predicate(this.input.peek()))
      str += this.input.next();
    return str;
  }

  read_number() {
    let has_dot = false;
    const number = this.read_while(ch => {
      if (ch === '.') {
        if (has_dot) return false;
        has_dot = true;
        return true;
      }
      return this.is_digit(ch);
    });
    return {
      type: TokenTypes.NUM,
      value: parseFloat(number)
    };
  }

  read_ident() {
    const id = this.read_while(this.is_id);
    return {
      type: this.is_keyword(id)
        ? TokenTypes.KEYWORD
        : TokenTypes.VAR,
      value: id,
    };
  }

  read_escaped(end) {
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

  read_string() {
    return {
      type: TokenTypes.STR,
      value: this.read_escaped('"')
    };
  }

  skip_comment() {
    this.read_while(ch => ch !== '\n');
    this.input.next();
  }

  read_next() {
    this.read_while(this.is_whitespace);
    if (this.input.eof()) return null;

    const ch = this.input.peek();
    if (ch === '#') {
      this.skip_comment();
      return this.read_next();
    }

    if (ch === '"') return this.read_string();
    if (this.is_digit(ch)) return this.read_number();
    if (this.is_id_start(ch)) return this.read_ident();
    if (this.is_punc(ch)) {
      return {
        type: TokenTypes.PUNC,
        value: this.input.next(),
      };
    }
    if (this.is_op_char(ch)) {
      return {
        type: TokenTypes.OP,
        value: this.read_while(this.is_op_char),
      };
    }
    this.input.croak(`Can't handle character: ${ch}`);
  }

  peek() {
    return this.current || (this.current = this.read_next());
  }

  next() {
    const tok = this.current;
    this.current = null;
    return tok || this.read_next();
  }

  eof() {
    return this.peek() == null;
  }
}

export default TokenStream;
