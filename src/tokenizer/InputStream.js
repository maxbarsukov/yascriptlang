class InputStream {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.col = 0;
  }

  next() {
    const ch = this.input.charAt(this.pos);
    const val = {
      value: ch,
      line: this.line,
      col: this.col,
      pos: this.pos,
    };
    this.pos++;
    if (ch === '\n') {
      this.line++;
      this.col = 0;
    } else {
      this.col++;
    }
    return val;
  }

  peek(x = 0) {
    return this.input.charAt(this.pos + x);
  }

  peekData(x = 0) {
    const ch = this.input.charAt(this.pos + x);
    const val = {
      value: ch,
      line: this.line,
      col: this.col,
      pos: this.pos,
    };
    for (let i = 0; i < x; i++) {
      if (this.input.charAt(val.pos) === '\n') {
        val.line++;
        val.col = 0;
      } else {
        val.col++;
      }
      val.pos++;
    }
    return val;
  }

  eof() {
    return this.peek() === '';
  }

  croak(type, msg) {
    throw new Error(`${type}: ${msg} at line ${this.line}:${this.col}`);
  }
}

export default InputStream;
