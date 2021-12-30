import { expect } from 'chai';
import TokenStreamHelper from '../src/tokenizer/TokenStreamHelper.js';

describe('Token Stream Helper', () => {
  it('TokenStream#isWhitespace() should be ok', () => {
    expect(TokenStreamHelper.isWhitespace(' ')).to.be.true;
    expect(TokenStreamHelper.isWhitespace('\t')).to.be.true;
    expect(TokenStreamHelper.isWhitespace('\n')).to.be.true;
    expect(TokenStreamHelper.isWhitespace('1')).to.be.false;
    expect(TokenStreamHelper.isWhitespace('a')).to.be.false;
  });

  it('TokenStream#isDigit() should be ok', () => {
    expect(TokenStreamHelper.isDigit('0')).to.be.true;
    expect(TokenStreamHelper.isDigit('1')).to.be.true;
    expect(TokenStreamHelper.isDigit('9')).to.be.true;
    expect(TokenStreamHelper.isDigit('a')).to.be.false;
    expect(TokenStreamHelper.isDigit('\n')).to.be.false;
  });

  it('TokenStream#isKeyword() should be ok', () => {
    expect(TokenStreamHelper.isKeyword('def')).to.be.true;
    expect(TokenStreamHelper.isKeyword('let')).to.be.true;
    expect(TokenStreamHelper.isKeyword('fn')).to.be.true;
    expect(TokenStreamHelper.isKeyword('if')).to.be.true;
    expect(TokenStreamHelper.isKeyword('(')).to.be.false;
    expect(TokenStreamHelper.isKeyword('+')).to.be.false;
    expect(TokenStreamHelper.isKeyword('++')).to.be.false;
  });

  it('TokenStream#isPunc() should be ok', () => {
    expect(TokenStreamHelper.isPunc('(')).to.be.true;
    expect(TokenStreamHelper.isPunc('[')).to.be.true;
    expect(TokenStreamHelper.isPunc('{')).to.be.true;
    expect(TokenStreamHelper.isPunc(',')).to.be.true;
    expect(TokenStreamHelper.isPunc(';')).to.be.true;
    expect(TokenStreamHelper.isPunc('a')).to.be.false;
    expect(TokenStreamHelper.isPunc('\n')).to.be.false;
    expect(TokenStreamHelper.isPunc('let')).to.be.false;
  });

  it('TokenStream#isOpChar() should be ok', () => {
    expect(TokenStreamHelper.isOpChar('+')).to.be.true;
    expect(TokenStreamHelper.isOpChar('++')).to.be.false;
    expect(TokenStreamHelper.isOpChar('-')).to.be.true;
    expect(TokenStreamHelper.isOpChar('*')).to.be.true;
    expect(TokenStreamHelper.isOpChar('def')).to.be.false;
    expect(TokenStreamHelper.isOpChar('(')).to.be.false;
    expect(TokenStreamHelper.isOpChar('\n')).to.be.false;
  });
});
