module.exports = {
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
      },
    },
  },
  env: {
    es6: true,
    node: true,
  },
  extends: ['plugin:@typescript-eslint/recommended'],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': 'off',
    'arrow-parens': 'warn',
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'never',
        functions: 'never',
      },
    ],
    'object-curly-newline': 'off',
    'no-mixed-operators': 'off',
    'arrow-body-style': 'warn',
    'function-paren-newline': 'off',
    'no-plusplus': 'off',
    'no-unused-vars': 'warn',
    'space-before-function-paren': 0,
    'no-underscore-dangle': 'warn',
    'max-len': ['warn', 100, 2, { ignoreUrls: true }],
    'no-console': 'off',
    'no-alert': 'warn',

    'no-param-reassign': 'off',
  },
};
