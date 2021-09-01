import { expect } from 'chai';
import InputStream from '../src/tokenizer/InputStream.js';

describe('Input Stream', () => {
  const code = `def sum = fn(a, b) -> {
  a + b;
};
print(sum(1, 2));
`;
  const input = new InputStream(code);

  it('InputStream#peek() should ok', () => {
    expect(input.peek()).to.equal('d');
  });

  it('InputStream#next() should ok', () => {
    expect(input.next().value).to.eq('d');
    expect(input.eof()).to.eq(false);
  });

  it('InputStream#eof() should be true', () => {
    while (!input.eof()) {
      input.next();
    }

    expect(input.eof()).to.eq(true);
    expect(input.next().value).to.eq('');
  });

  it('InputStream#croak() should throw an error', () => {
    expect(() => input.croak('Syntax Error', 'Test Error')).to.throws();
  });
});
