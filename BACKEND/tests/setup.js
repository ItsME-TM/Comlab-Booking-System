// Test setup file
// This file runs before each test file

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);