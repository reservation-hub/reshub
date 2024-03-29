module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  plugins: [
    '@typescript-eslint',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'arrow-parens': ['error', 'as-needed'],
    'arrow-body-style': 'error',
    'arrow-spacing': 'error',
    'generator-star-spacing': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'max-classes-per-file': 'off',
    'max-len': ['error', { code: 120 }],
    'no-console': ['error', { allow: ['error'] }],
    'no-duplicate-imports': 'error',
    'no-underscore-dangle': ['warn', { allow: ['_id', '_count'] }],
    'no-useless-computed-key': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-var': 'error',
    'no-shadow': 'off',
    'no-explicit-any': 'off',
    'no-param-reassign': ['error', { props: false }],
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'rest-spread-spacing': 'error',
    semi: ['error', 'never'],
  },
}
