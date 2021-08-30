const TokenTypes = {
  NUM: 'num', // numbers
  STR: 'str', // strings
  VAR: 'var', // identifiers
  KEYWORD: 'kw', // keywords
  PUNC: 'punc', // punctuation: parens, comma, semicolon etc.
  OP: 'op', // operators
  MOD: 'mod', // modificator
  COMMENT: 'comment', // comment: #, //, /* */
  MUT: 'mut', // mutable
};

export default TokenTypes;
