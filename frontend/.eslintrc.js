module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'react-app', 'react-app/jest', 'prettier'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // React specific
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/prop-types': 'warn',
    'react/jsx-key': 'error',
    'react/no-unused-state': 'warn',
    'react/no-direct-mutation-state': 'error',

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Best practices
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',

    // Error prevention
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-return': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'build/',
    'coverage/',
    'public/',
    '*.min.js',
    '*.min.css',
    'serviceWorker.js',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
