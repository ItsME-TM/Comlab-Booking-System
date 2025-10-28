const baseConfig = require('./environment');
const developmentConfig = require('./development');
const productionConfig = require('./production');
const testConfig = require('./test');

/**
 * Configuration Manager
 * Merges base configuration with environment-specific overrides
 */

/**
 * Deep merge utility function
 */
const deepMerge = (target, source) => {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
};

/**
 * Get environment-specific configuration
 */
const getConfig = () => {
  const environment = process.env.NODE_ENV || 'development';

  let envConfig = {};

  switch (environment) {
    case 'development':
      envConfig = developmentConfig;
      break;
    case 'production':
      envConfig = productionConfig;
      break;
    case 'test':
      envConfig = testConfig;
      break;
    default:
      envConfig = developmentConfig;
  }

  // Merge base configuration with environment-specific overrides
  const finalConfig = deepMerge(baseConfig, envConfig);

  // Add computed properties
  finalConfig.isDevelopment = environment === 'development';
  finalConfig.isProduction = environment === 'production';
  finalConfig.isTest = environment === 'test';

  return finalConfig;
};

/**
 * Configuration validation
 */
const validateConfiguration = config => {
  const errors = [];

  // Validate required configurations
  if (!config.database.url) {
    errors.push('Database URL is required');
  }

  if (!config.jwt.secret) {
    errors.push('JWT secret is required');
  }

  if (!config.email.user || !config.email.password) {
    errors.push('Email configuration is incomplete');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
};

/**
 * Initialize and export configuration
 */
const config = getConfig();

// Validate configuration
validateConfiguration(config);

// Log configuration summary (without sensitive data)
if (config.isDevelopment) {
  console.log('Configuration loaded:', {
    environment: config.app.env,
    port: config.app.port,
    database: config.database.url ? 'Connected' : 'Not configured',
    logging: config.logging.level,
  });
}

module.exports = config;
