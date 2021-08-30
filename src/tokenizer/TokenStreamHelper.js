import Keywords from './Keywords.js';

const TokenStreamHelper = {
  keywords: Object.values(Keywords),
  isWhitespace(ch) {
    return ' \t\n'.includes(ch);
  },
  isDigit(ch) {
    return /[0-9]/i.test(ch);
  },
  isIdStart(ch) {
    return /[a-zλ_]/i.test(ch);
  },
  isId(ch) {
    return TokenStreamHelper.isIdStart(ch) || '?!-<>=0123456789'.includes(ch);
  },
  isKeyword(x) {
    return this.keywords.includes(x);
  },
  isPunc(ch) {
    return ',;(){}[]'.includes(ch);
  },
  isOpChar(ch) {
    return '+-*/%=&|<>!^'.includes(ch);
  },
};

export default TokenStreamHelper;
