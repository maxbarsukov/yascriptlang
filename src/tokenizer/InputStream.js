class InputStream {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.col = 0;
  }

  next() {
    const ch = this.input.charAt(this.pos++);
    if (ch === '\n') {
      this.line++;
      this.col = 0;
    } else {
      this.col++;
    }
    return ch;
  }

  peek() {
    return this.input.charAt(this.pos);
  }

  eof() {
    return this.peek() === '';
  }

  croak(msg) {
    throw new Error(`${msg} (${this.line}:${this.col})`);
  }
}

export default InputStream;
