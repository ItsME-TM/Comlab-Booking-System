module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/logger.js', // Exclude logger from coverage (complex winston setup)
    '!src/models/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  verbose: true,
  // Clear mocks between tests
  clearMocks: true,
  // Reset modules between tests for configuration tests
  resetModules: false,
};