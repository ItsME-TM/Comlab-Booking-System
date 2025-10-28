/**
 * Production Environment Configuration
 * Settings optimized for production deployment
 */

module.exports = {
  // Database settings for production
  database: {
    debug: false, // Disable mongoose debug mode
    autoIndex: false, // Disable automatic index creation
    maxPoolSize: 20, // Larger connection pool
  },

  // Logging settings for production
  logging: {
    level: 'warn',
    enableConsole: false,
    enableFile: true,
    enableErrorReporting: true,
  },

  // Security settings for production (strict)
  security: {
    rateLimitMax: 50,
    enableCors: true,
    corsOrigin: process.env.FRONTEND_URL,
    enableHelmet: true, // Security headers
    enableCompression: true,
  },

  // Production optimizations
  production: {
    enableCaching: true,
    enableMinification: true,
    enableGzip: true,
    trustProxy: true,
  },

  // Email settings for production
  email: {
    enableSending: true,
    enableRetry: true,
    retryAttempts: 3,
  },

  // File upload settings for production
  upload: {
    enableCloudStorage: process.env.ENABLE_CLOUD_STORAGE === 'true',
    cloudProvider: process.env.CLOUD_PROVIDER || 'aws',
  },

  // Monitoring and health checks
  monitoring: {
    enableHealthCheck: true,
    enableMetrics: true,
    metricsInterval: 60000, // 1 minute
  },
};
