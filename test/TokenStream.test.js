import { expect } from 'chai';
import InputStream from '../src/tokenizer/InputStream.js';
import TokenStream from '../src/tokenizer/TokenStream.js';
import TokenTypes from '../src/tokenizer/TokenTypes.js';

describe('token stream', () => {
  const code = `def sum = fn(a, b) -> {
  a + b;
};
print(sum(1, 2));
`;
  const input = new InputStream(code);
  const token = new TokenStream(input);

  it('TokenStream#peek() should return the current token', () => {
    const curToken = token.peek();
    expect(curToken.type).to.eq(TokenTypes.KEYWORD);
  });

  it('TokenStream#next() should return next token', () => {
    token.next();
    token.next();
    const op = token.next();
    expect(op.type).to.eq(TokenTypes.OP);
    expect(op.value).to.eq('=');

    const id = token.next();
    expect(id.type).to.eq(TokenTypes.KEYWORD);
    expect(id.value).to.eq('fn');

    const openPar = token.next();
    expect(openPar.type).to.eq(TokenTypes.PUNC);
    expect(openPar.value).to.eq('(');

    const aVar = token.next();
    expect(aVar.type).to.eq(TokenTypes.VAR);
    expect(aVar.value).to.eq('a');

    const comma = token.next();
    expect(comma.type).to.eq(TokenTypes.PUNC);
    expect(comma.value).to.eq(',');

    const bVar = token.next();
    expect(bVar.type).to.eq(TokenTypes.VAR);
    expect(bVar.value).to.eq('b');

    const closePar = token.next();
    expect(closePar.type).to.eq(TokenTypes.PUNC);
    expect(closePar.value).to.eq(')');
  });

  it('TokenStream#eof() should be true', () => {
    while (!token.eof()) {
      token.next();
    }
    expect(token.eof()).to.eq(true);
    expect(token.next()).to.eq(null);
  });

  it('TokenStream#croak() should throw an error', () => {
    expect(() => token.croak('Parse Error', 'Test Error')).to.throws();
  });
});
