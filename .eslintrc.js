module.exports = {
  env: {
    node: true,
    commonjs: true,
    es6: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'no-console': ['error', { allow: ['error', 'warn'] }],
    'no-ternary': 'error',
    'no-return-await': 'error',
    'no-plusplus': 'error',
    'no-lonely-if': 'error',
    'no-unused-vars': 'error',
    'no-undef': 'error',
    eqeqeq: ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',
  },
  ignorePatterns: [''],
};
