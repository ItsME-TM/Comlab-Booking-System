/**
 * Test Environment Configuration
 * Settings optimized for testing
 */

module.exports = {
  // Database settings for testing
  database: {
    debug: false,
    autoIndex: true,
    useMemoryDB: process.env.USE_MEMORY_DB === 'true',
  },

  // Logging settings for testing (minimal)
  logging: {
    level: 'error',
    enableConsole: false,
    enableFile: false,
  },

  // Security settings for testing
  security: {
    rateLimitMax: 10000, // Very lenient for tests
    enableCors: false,
    bcryptRounds: 4, // Faster hashing for tests
  },

  // Test-specific settings
  test: {
    enableMockData: true,
    enableTestRoutes: true,
    fastMode: true, // Skip time-consuming operations
    cleanupAfterTests: true,
  },

  // Email settings for testing
  email: {
    enableSending: false,
    useMockService: true,
  },

  // JWT settings for testing
  jwt: {
    expiresIn: '1h', // Shorter expiry for tests
    secret: 'test-secret-key-for-testing-only-not-secure',
  },

  // File upload settings for testing
  upload: {
    enableLocalStorage: true,
    useTempDirectory: true,
    cleanupOnExit: true,
  },
};