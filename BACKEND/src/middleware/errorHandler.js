const logger = require('../config/logger');

/**
 * Custom Error Classes
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Error Response Formatter
 * Formats error responses consistently
 */
const formatErrorResponse = (err, req) => {
  const response = {
    success: false,
    message: err.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Add error details for validation errors
  if (err.name === 'ValidationError' && err.errors) {
    response.errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Add error details for MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    response.message = `${field} already exists`;
    response.field = field;
  }

  return response;
};

/**
 * Development Error Handler
 * Provides detailed error information for development
 */
const handleDevelopmentError = (err, req, res) => {
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  const response = formatErrorResponse(err, req);
  res.status(err.statusCode || 500).json(response);
};

/**
 * Production Error Handler
 * Provides sanitized error information for production
 */
const handleProductionError = (err, req, res) => {
  // Log error details
  logger.error(`${err.name}: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Only send operational errors to client
  if (err.isOperational) {
    const response = formatErrorResponse(err, req);
    delete response.stack; // Never send stack trace in production
    res.status(err.statusCode).json(response);
  } else {
    // Programming or unknown errors: don't leak error details
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
    });
  }
};

/**
 * Global Error Handler Middleware
 * Centralized error handling for the entire application
 */
const globalErrorHandler = (err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle different error types
  if (process.env.NODE_ENV === 'development') {
    handleDevelopmentError(err, req, res);
  } else {
    handleProductionError(err, req, res);
  }
};

/**
 * Async Error Handler Wrapper
 * Wraps async functions to catch errors automatically
 */
const asyncHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found Handler
 * Handles requests to non-existent routes
 */
const notFoundHandler = (req, res, next) => {
  const err = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(err);
};

/**
 * Request Logger Middleware
 * Logs incoming HTTP requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
      },
    );
  });

  next();
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  globalErrorHandler,
  asyncHandler,
  notFoundHandler,
  requestLogger,
};
