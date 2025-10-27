/**
 * Development Environment Configuration
 * Settings optimized for development workflow
 */

module.exports = {
  // Database settings for development
  database: {
    debug: true, // Enable mongoose debug mode
    autoIndex: true, // Allow automatic index creation
  },

  // Logging settings for development
  logging: {
    level: 'debug',
    enableConsole: true,
    enableFile: false, // Disable file logging in development
  },

  // Security settings for development (more lenient)
  security: {
    rateLimitMax: 1000,
    enableCors: true,
    corsOrigin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  },

  // Development tools
  development: {
    enableMockData: true,
    enableApiDocs: true,
    enableDebugRoutes: true,
    hotReload: true,
  },

  // Email settings for development (use test accounts)
  email: {
    enableSending: false, // Disable actual email sending
    logEmails: true, // Log email content instead
  },

  // File upload settings for development
  upload: {
    enableLocalStorage: true,
    cleanupOnRestart: false,
  },
};