const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');

module.exports = [
  // Ignores
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'coverage/**',
      'public/**',
      '*.min.js',
      '*.min.css',
      'serviceWorker.js',
    ],
  },

  // Frontend configuration
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.jest,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettier.rules,
      'prettier/prettier': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'warn',
      'react/jsx-key': 'error',
      'react/no-unused-state': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
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
