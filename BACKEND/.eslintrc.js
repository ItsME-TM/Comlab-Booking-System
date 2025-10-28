module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs',
  },
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

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
    'coverage/',
    'logs/',
    '*.log',
    '.env',
    '.env.*',
    'dist/',
    'build/',
  ],
};
