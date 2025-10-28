const winston = require('winston');
const path = require('path');

/**
 * Logger Configuration
 * Provides structured logging with different levels and formats
 * Uses configuration from environment settings
 */

// Get configuration (avoid circular dependency by requiring here)
let config;
try {
  config = require('./environment');
} catch (error) {
  // Fallback configuration if environment config is not available
  config = {
    logging: {
      level:
        process.env.LOG_LEVEL ||
        (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
      maxFiles: 5,
      maxSize: '20m',
    },
    app: {
      env: process.env.NODE_ENV || 'development',
    },
  };
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define log format for console
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(info => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : '';
    return `${timestamp} ${level}: ${message} ${metaStr}`;
  }),
);

// Define log format for files
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Create transports array
const transports = [];

// Console transport (always enabled in development)
if (config.app.env === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: config.logging.level,
    }),
  );
}

// File transports (enabled based on configuration)
if (config.app.env !== 'test') {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
    }),
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: fileFormat,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
    }),
  );
}

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  transports,
  exitOnError: false,
  // Handle exceptions and rejections
  exceptionHandlers:
    config.app.env !== 'test'
      ? [
          new winston.transports.File({
            filename: path.join(__dirname, '../../logs/exceptions.log'),
            format: fileFormat,
          }),
        ]
      : [],
  rejectionHandlers:
    config.app.env !== 'test'
      ? [
          new winston.transports.File({
            filename: path.join(__dirname, '../../logs/rejections.log'),
            format: fileFormat,
          }),
        ]
      : [],
});

// Create a stream object for HTTP request logging
logger.stream = {
  write: message => {
    logger.http(message.trim());
  },
};

// Add helper methods
logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
};

logger.logRequest = (req, res, duration) => {
  const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
  logger[logLevel](`${req.method} ${req.originalUrl} ${res.statusCode}`, {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });
};

module.exports = logger;
