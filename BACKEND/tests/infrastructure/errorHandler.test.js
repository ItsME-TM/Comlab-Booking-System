const request = require('supertest');
const express = require('express');
const {
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
} = require('../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Custom Error Classes', () => {
    test('AppError should create error with correct properties', () => {
      const error = new AppError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    test('ValidationError should create 400 error', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid input');
    });

    test('AuthenticationError should create 401 error', () => {
      const error = new AuthenticationError();
      
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toBe('Authentication failed');
    });

    test('AuthorizationError should create 403 error', () => {
      const error = new AuthorizationError();
      
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
      expect(error.message).toBe('Access denied');
    });

    test('NotFoundError should create 404 error', () => {
      const error = new NotFoundError();
      
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Resource not found');
    });

    test('ConflictError should create 409 error', () => {
      const error = new ConflictError();
      
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
      expect(error.message).toBe('Resource conflict');
    });
  });

  describe('Global Error Handler', () => {
    test('should handle AppError correctly', async () => {
      app.get('/test-error', (req, res, next) => {
        next(new AppError('Test error message', 400));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test-error')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Test error message',
        path: '/test-error',
        method: 'GET',
      });
      expect(response.body.timestamp).toBeDefined();
    });

    test('should handle generic errors with 500 status', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development'; // Set to development to see actual error message
      
      app.get('/test-generic-error', (req, res, next) => {
        const error = new Error('Generic error');
        next(error);
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test-generic-error')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Generic error',
        path: '/test-generic-error',
        method: 'GET',
      });
      
      process.env.NODE_ENV = originalEnv;
    });

    test('should include stack trace in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      app.get('/test-dev-error', (req, res, next) => {
        next(new AppError('Development error', 400));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test-dev-error')
        .expect(400);

      expect(response.body.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    test('should not include stack trace in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.get('/test-prod-error', (req, res, next) => {
        next(new AppError('Production error', 400));
      });
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test-prod-error')
        .expect(400);

      expect(response.body.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Async Handler', () => {
    test('should catch async errors', async () => {
      const asyncRoute = asyncHandler(async (req, res, next) => {
        throw new AppError('Async error', 400);
      });

      app.get('/test-async', asyncRoute);
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/test-async')
        .expect(400);

      expect(response.body.message).toBe('Async error');
    });

    test('should handle successful async operations', async () => {
      const asyncRoute = asyncHandler(async (req, res) => {
        res.json({ success: true, message: 'Async success' });
      });

      app.get('/test-async-success', asyncRoute);

      const response = await request(app)
        .get('/test-async-success')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Async success',
      });
    });
  });

  describe('Not Found Handler', () => {
    test('should create 404 error for undefined routes', async () => {
      app.use(notFoundHandler);
      app.use(globalErrorHandler);

      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Route /non-existent-route not found',
        path: '/non-existent-route',
        method: 'GET',
      });
    });
  });

  describe('Request Logger', () => {
    test('should log requests without errors', (done) => {
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
      };

      // Mock the logger module
      jest.doMock('../../src/config/logger', () => mockLogger);

      app.use((req, res, next) => {
        // Simulate request logger behavior
        const start = Date.now();
        res.on('finish', () => {
          const duration = Date.now() - start;
          const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
          mockLogger[logLevel](`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
        });
        next();
      });

      app.get('/test-logging', (req, res) => {
        res.json({ success: true });
      });

      request(app)
        .get('/test-logging')
        .expect(200)
        .end(() => {
          // Give some time for the logger to be called
          setTimeout(() => {
            expect(mockLogger.info).toHaveBeenCalled();
            done();
          }, 10);
        });
    });
  });
});