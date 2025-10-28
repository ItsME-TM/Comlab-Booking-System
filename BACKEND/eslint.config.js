const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');
const globals = require('globals');

module.exports = [
  // Ignores
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'logs/**',
      '*.log',
      '.env',
      '.env.*',
      'dist/**',
      'build/**',
    ],
  },

  // Backend configuration
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettier.rules,
      'prettier/prettier': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-return': 'error',
    },
  },
];
