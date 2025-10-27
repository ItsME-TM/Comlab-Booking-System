const dotenv = require('dotenv');
const path = require('path');

/**
 * Environment Configuration Management
 * Validates and organizes environment variables
 */

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Required Environment Variables
 * These must be present for the application to function
 */
const requiredEnvVars = [
  'MONGODB_URL',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS'
];

/**
 * Validate Required Environment Variables
 */
const validateEnvironment = () => {
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

/**
 * Environment Configuration Object
 * Organizes all configuration in a structured way
 */
const config = {
  // Application Settings
  app: {
    name: process.env.APP_NAME || 'Lab Booking System',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT) || 8070,
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
  },

  // Database Configuration
  database: {
    url: process.env.MONGODB_URL,
    options: {
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
      serverSelectionTimeoutMS: parseInt(process.env.DB_TIMEOUT) || 5000,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'lab-booking-system',
  },

  // Email Configuration
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif'],
    uploadPath: process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads'),
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    maxSize: process.env.LOG_MAX_SIZE || '20m',
  },

  // Frontend Configuration
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    buildPath: process.env.FRONTEND_BUILD_PATH || path.join(__dirname, '../../../frontend/build'),
  },

  // Development Configuration
  development: {
    enableMockData: process.env.ENABLE_MOCK_DATA === 'true' || false,
    debugMode: process.env.DEBUG_MODE === 'true' || false,
    hotReload: process.env.HOT_RELOAD === 'true' || true,
  },

  // Production Configuration
  production: {
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
    enableHttps: process.env.ENABLE_HTTPS === 'true' || false,
    sslCertPath: process.env.SSL_CERT_PATH,
    sslKeyPath: process.env.SSL_KEY_PATH,
  },
};

/**
 * Environment-specific Configuration Overrides
 */
const getEnvironmentConfig = () => {
  const baseConfig = { ...config };

  switch (baseConfig.app.env) {
    case 'development':
      return {
        ...baseConfig,
        logging: {
          ...baseConfig.logging,
          level: 'debug',
        },
        security: {
          ...baseConfig.security,
          rateLimitMax: 1000, // More lenient in development
        },
      };

    case 'test':
      return {
        ...baseConfig,
        database: {
          ...baseConfig.database,
          url: process.env.TEST_MONGODB_URL || baseConfig.database.url,
        },
        logging: {
          ...baseConfig.logging,
          level: 'error', // Minimal logging in tests
        },
        jwt: {
          ...baseConfig.jwt,
          expiresIn: '1h', // Shorter expiry for tests
        },
      };

    case 'production':
      return {
        ...baseConfig,
        logging: {
          ...baseConfig.logging,
          level: 'warn',
        },
        security: {
          ...baseConfig.security,
          rateLimitMax: 50, // Stricter in production
        },
      };

    default:
      return baseConfig;
  }
};

/**
 * Configuration Validation
 */
const validateConfig = (config) => {
  // Validate port
  if (config.app.port < 1 || config.app.port > 65535) {
    throw new Error('PORT must be between 1 and 65535');
  }

  // Validate JWT secret strength
  if (config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate email configuration
  if (!config.email.user.includes('@')) {
    throw new Error('EMAIL_USER must be a valid email address');
  }

  // Validate bcrypt rounds
  if (config.security.bcryptRounds < 10 || config.security.bcryptRounds > 15) {
    throw new Error('BCRYPT_ROUNDS must be between 10 and 15');
  }

  return true;
};

/**
 * Initialize Configuration
 */
const initializeConfig = () => {
  try {
    // Validate required environment variables
    validateEnvironment();
    
    // Get environment-specific configuration
    const envConfig = getEnvironmentConfig();
    
    // Validate configuration
    validateConfig(envConfig);
    
    return envConfig;
  } catch (error) {
    if (process.env.NODE_ENV === 'test') {
      throw error; // In tests, throw the error instead of exiting
    }
    console.error('Configuration Error:', error.message);
    process.exit(1);
  }
};

// Export the initialized configuration
module.exports = initializeConfig();