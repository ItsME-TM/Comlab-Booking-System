const path = require('path');

describe('Configuration Management', () => {
  describe('Configuration Structure', () => {
    test('should have correct app configuration structure', () => {
      // Use the already loaded config from test setup
      const config = require('../../src/config');

      expect(config.app).toMatchObject({
        name: expect.any(String),
        version: expect.any(String),
        port: expect.any(Number),
        env: expect.any(String),
        host: expect.any(String),
      });
    });

    test('should have correct database configuration structure', () => {
      const config = require('../../src/config');

      expect(config.database).toMatchObject({
        url: expect.any(String),
        options: expect.any(Object),
      });
    });

    test('should have correct JWT configuration structure', () => {
      const config = require('../../src/config');

      expect(config.jwt).toMatchObject({
        secret: expect.any(String),
        expiresIn: expect.any(String),
        refreshExpiresIn: expect.any(String),
        issuer: expect.any(String),
      });
    });

    test('should have correct email configuration structure', () => {
      const config = require('../../src/config');

      expect(config.email).toMatchObject({
        user: expect.any(String),
        password: expect.any(String),
        host: expect.any(String),
        port: expect.any(Number),
        secure: expect.any(Boolean),
        from: expect.any(String),
      });
    });

    test('should have correct security configuration structure', () => {
      const config = require('../../src/config');

      expect(config.security).toMatchObject({
        bcryptRounds: expect.any(Number),
        rateLimitWindow: expect.any(Number),
        rateLimitMax: expect.any(Number),
        corsOrigin: expect.any(String),
      });
    });
  });

  describe('Environment-specific Settings', () => {
    test('should have test environment flags set correctly', () => {
      const config = require('../../src/config');

      expect(config.app.env).toBe('test');
      expect(config.isTest).toBe(true);
      expect(config.isDevelopment).toBe(false);
      expect(config.isProduction).toBe(false);
    });

    test('should apply test-specific settings', () => {
      const config = require('../../src/config');

      expect(config.logging.level).toBe('error');
      expect(config.jwt.expiresIn).toBe('1h');
      expect(config.security.bcryptRounds).toBe(4);
    });
  });

  describe('Configuration Validation', () => {
    test('should validate configuration properties exist', () => {
      const config = require('../../src/config');

      // Test that required configuration sections exist
      expect(config.app).toBeDefined();
      expect(config.database).toBeDefined();
      expect(config.jwt).toBeDefined();
      expect(config.email).toBeDefined();
      expect(config.security).toBeDefined();
      expect(config.logging).toBeDefined();
    });

    test('should have valid port number', () => {
      const config = require('../../src/config');
      
      expect(config.app.port).toBeGreaterThan(0);
      expect(config.app.port).toBeLessThan(65536);
    });

    test('should have valid JWT secret', () => {
      const config = require('../../src/config');
      
      expect(config.jwt.secret).toBeDefined();
      expect(config.jwt.secret.length).toBeGreaterThan(10);
    });

    test('should have valid email configuration', () => {
      const config = require('../../src/config');
      
      expect(config.email.user).toContain('@');
      expect(config.email.password).toBeDefined();
      expect(config.email.host).toBeDefined();
      expect(config.email.port).toBeGreaterThan(0);
    });

    test('should have valid bcrypt rounds', () => {
      const config = require('../../src/config');
      
      expect(config.security.bcryptRounds).toBeGreaterThanOrEqual(4);
      expect(config.security.bcryptRounds).toBeLessThanOrEqual(15);
    });
  });
});