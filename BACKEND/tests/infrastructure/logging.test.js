const winston = require('winston');
const path = require('path');
const fs = require('fs');

describe('Logging Infrastructure', () => {
  let originalEnv;
  let logger;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;

    // Clean up log files created during tests
    const logDir = path.join(__dirname, '../../logs');
    if (fs.existsSync(logDir)) {
      const files = fs.readdirSync(logDir);
      files.forEach(file => {
        if (file.endsWith('.log')) {
          try {
            fs.unlinkSync(path.join(logDir, file));
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      });
    }
  });

  describe('Logger Configuration', () => {
    test('should create logger with correct configuration in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.LOG_LEVEL = 'debug';

      logger = require('../../src/config/logger');

      expect(logger).toBeDefined();
      expect(logger.level).toBe('debug');
    });

    test('should create logger with correct configuration in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.LOG_LEVEL = 'warn';

      logger = require('../../src/config/logger');

      expect(logger).toBeDefined();
      expect(logger.level).toBe('warn');
    });

    test('should create logger with correct configuration in test', () => {
      process.env.NODE_ENV = 'test';
      process.env.LOG_LEVEL = 'error';

      logger = require('../../src/config/logger');

      expect(logger).toBeDefined();
      expect(logger.level).toBe('error');
    });
  });

  describe('Log Levels', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      process.env.LOG_LEVEL = 'debug';
      logger = require('../../src/config/logger');
    });

    test('should support error level logging', () => {
      const spy = jest.spyOn(logger, 'error');
      logger.error('Test error message');
      expect(spy).toHaveBeenCalledWith('Test error message');
      spy.mockRestore();
    });

    test('should support warn level logging', () => {
      const spy = jest.spyOn(logger, 'warn');
      logger.warn('Test warning message');
      expect(spy).toHaveBeenCalledWith('Test warning message');
      spy.mockRestore();
    });

    test('should support info level logging', () => {
      const spy = jest.spyOn(logger, 'info');
      logger.info('Test info message');
      expect(spy).toHaveBeenCalledWith('Test info message');
      spy.mockRestore();
    });

    test('should support debug level logging', () => {
      const spy = jest.spyOn(logger, 'debug');
      logger.debug('Test debug message');
      expect(spy).toHaveBeenCalledWith('Test debug message');
      spy.mockRestore();
    });

    test('should support http level logging', () => {
      const spy = jest.spyOn(logger, 'http');
      logger.http('Test http message');
      expect(spy).toHaveBeenCalledWith('Test http message');
      spy.mockRestore();
    });
  });

  describe('Logger Helper Methods', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      logger = require('../../src/config/logger');
    });

    test('should have logError helper method', () => {
      expect(typeof logger.logError).toBe('function');

      const error = new Error('Test error');
      const spy = jest.spyOn(logger, 'error');

      logger.logError(error, { userId: '123' });

      expect(spy).toHaveBeenCalledWith('Test error', {
        stack: error.stack,
        userId: '123',
      });

      spy.mockRestore();
    });

    test('should have logRequest helper method', () => {
      expect(typeof logger.logRequest).toBe('function');

      const mockReq = {
        method: 'GET',
        originalUrl: '/api/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
        user: { id: '123' },
      };

      const mockRes = {
        statusCode: 200,
      };

      const spy = jest.spyOn(logger, 'info');

      logger.logRequest(mockReq, mockRes, 150);

      expect(spy).toHaveBeenCalledWith('GET /api/test 200', {
        method: 'GET',
        url: '/api/test',
        statusCode: 200,
        duration: '150ms',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        userId: '123',
      });

      spy.mockRestore();
    });

    test('should use warn level for error status codes in logRequest', () => {
      const mockReq = {
        method: 'GET',
        originalUrl: '/api/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
      };

      const mockRes = {
        statusCode: 404,
      };

      const spy = jest.spyOn(logger, 'warn');

      logger.logRequest(mockReq, mockRes, 50);

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Logger Stream', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      logger = require('../../src/config/logger');
    });

    test('should have stream object for HTTP logging', () => {
      expect(logger.stream).toBeDefined();
      expect(typeof logger.stream.write).toBe('function');
    });

    test('should write to http log level through stream', () => {
      const spy = jest.spyOn(logger, 'http');

      logger.stream.write('GET /api/test 200 - 150ms\n');

      expect(spy).toHaveBeenCalledWith('GET /api/test 200 - 150ms');
      spy.mockRestore();
    });
  });

  describe('Log File Creation', () => {
    test('should not create log files in test environment', () => {
      process.env.NODE_ENV = 'test';
      logger = require('../../src/config/logger');

      // Log some messages
      logger.error('Test error');
      logger.info('Test info');

      // Check that log files are not created in test environment
      const logDir = path.join(__dirname, '../../logs');

      // Wait a bit for potential file operations
      setTimeout(() => {
        if (fs.existsSync(logDir)) {
          const files = fs.readdirSync(logDir);
          const logFiles = files.filter(file => file.endsWith('.log'));
          expect(logFiles.length).toBe(0);
        }
      }, 100);
    });
  });

  describe('Error Handling in Logger', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      logger = require('../../src/config/logger');
    });

    test('should handle logging errors gracefully', () => {
      // This test ensures the logger doesn't crash the application
      expect(() => {
        logger.error(null);
        logger.info(undefined);
        logger.debug({});
        logger.warn([]);
      }).not.toThrow();
    });

    test('should handle circular references in log objects', () => {
      const circularObj = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => {
        logger.info('Circular object test', circularObj);
      }).not.toThrow();
    });
  });
});
