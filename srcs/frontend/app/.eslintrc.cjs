module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'postcss.config.cjs', 'tsconfig.json'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    indent: ['error', 2],
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],
    eqeqeq: ['error', 'always', { 'null': 'ignore' }],
    'no-trailing-spaces': ['error'],
    'eol-last': ['error', 'always'],
    'space-infix-ops': ['error'],
    'comma-spacing': ['error'],
    'brace-style': ['error'],
  },
}
