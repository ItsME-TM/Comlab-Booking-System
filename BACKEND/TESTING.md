# Testing Guide

## Overview

This document provides comprehensive information about testing the Lab Booking System backend.

## Test Structure

```
backend/tests/
├── helpers/              # Test helper utilities
│   └── dbHelper.js      # Database helper functions
├── infrastructure/       # Infrastructure tests
│   ├── configuration.test.js
│   ├── errorHandler.test.js
│   └── logging.test.js
├── integration/         # Integration tests
│   ├── auth.integration.test.js
│   ├── booking.integration.test.js
│   └── database.integration.test.js
├── repositories/        # Repository layer tests
│   ├── BookingRepository.test.js
│   ├── NotificationRepository.test.js
│   └── UserRepository.test.js
├── services/           # Service layer tests
│   ├── AuthService.test.js
│   ├── BookingService.test.js
│   ├── NotificationService.test.js
│   └── UserService.test.js
├── globalSetup.js      # Global test setup
├── globalTeardown.js   # Global test teardown
├── setup.js            # Test environment setup
└── simple.test.js      # Simple sanity test
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- auth.integration.test.js
```

### Run Tests Matching Pattern
```bash
npm test -- --testPathPattern="integration"
```

## Test Configuration

### Jest Configuration

The project uses Jest as the testing framework. Configuration is in `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Coverage Thresholds

The project maintains a minimum of 80% test coverage:

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Test Environment

### Environment Variables

Test environment variables are set in `tests/setup.js`:

```javascript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes-only';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.EMAIL_ENABLED = 'false';
process.env.PORT = '8071';
process.env.LOG_LEVEL = 'error';
```

### Database

Tests use MongoDB Memory Server for an in-memory database:

- Automatically starts before tests
- Automatically stops after tests
- Each test gets a clean database state
- No need for external MongoDB instance

## Mocking

### Nodemailer Mock

Email functionality is mocked in tests to avoid sending real emails:

```javascript
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      accepted: ['test@example.com'],
      rejected: [],
      response: '250 Message accepted',
    }),
    verify: jest.fn().mockResolvedValue(true),
  }),
}));
```

### Console Mock

Console methods are mocked to reduce noise during tests:

```javascript
global.console = {
  ...console,
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
```

## Writing Tests

### Test Structure

Follow the AAA pattern (Arrange, Act, Assert):

```javascript
describe('Feature Name', () => {
  describe('Method Name', () => {
    it('should do something specific', async () => {
      // Arrange: Set up test data
      const testData = { /* ... */ };
      
      // Act: Execute the code being tested
      const result = await someFunction(testData);
      
      // Assert: Verify the results
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Integration Tests

Integration tests verify that multiple components work together:

```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('API Endpoint Integration Tests', () => {
  it('should handle complete workflow', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send(testData)
      .expect(200);
      
    expect(response.body).toMatchObject(expectedResponse);
  });
});
```

### Unit Tests

Unit tests verify individual functions in isolation:

```javascript
const ServiceClass = require('../../src/services/ServiceClass');

describe('ServiceClass', () => {
  let service;
  
  beforeEach(() => {
    service = new ServiceClass();
  });
  
  it('should validate input correctly', () => {
    const errors = service.validateInput(invalidData);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('required');
  });
});
```

## Test Helpers

### Database Helper

The `dbHelper.js` provides utilities for test data management:

```javascript
const DbHelper = require('../helpers/dbHelper');

// Clear all collections
await DbHelper.clearAllCollections();

// Create test data
await DbHelper.createTestData(Model, data);

// Find test data
const data = await DbHelper.findTestData(Model, query);
```

## Best Practices

### 1. Test Isolation

Each test should be independent and not rely on other tests:

```javascript
beforeEach(async () => {
  // Clear database before each test
  await DbHelper.clearAllCollections();
});
```

### 2. Descriptive Test Names

Use clear, descriptive test names:

```javascript
// Good
it('should return 400 when email is missing', async () => { /* ... */ });

// Bad
it('test email validation', async () => { /* ... */ });
```

### 3. Test Edge Cases

Test both happy paths and error cases:

```javascript
describe('createBooking', () => {
  it('should create booking with valid data', async () => { /* ... */ });
  it('should reject booking with past date', async () => { /* ... */ });
  it('should reject booking with conflicting time', async () => { /* ... */ });
  it('should reject booking without required fields', async () => { /* ... */ });
});
```

### 4. Use Async/Await

Always use async/await for asynchronous operations:

```javascript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### 5. Clean Up Resources

Clean up after tests to prevent memory leaks:

```javascript
afterEach(async () => {
  jest.clearAllMocks();
  await DbHelper.clearAllCollections();
});

afterAll(async () => {
  await mongoose.connection.close();
});
```

## Debugging Tests

### Run Single Test

```bash
npm test -- --testNamePattern="specific test name"
```

### Enable Verbose Output

```bash
npm test -- --verbose
```

### Debug in VS Code

Add this configuration to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/backend/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Common Issues

### Tests Timeout

If tests timeout, increase the timeout:

```javascript
jest.setTimeout(30000); // 30 seconds
```

### Database Connection Issues

Ensure MongoDB Memory Server is properly configured:

```javascript
// In globalSetup.js
const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri();
process.env.MONGODB_URL = uri;
```

### Mock Not Working

Ensure mocks are defined before imports:

```javascript
// Mock must be before require
jest.mock('nodemailer');
const app = require('../../src/app');
```

## Continuous Integration

Tests run automatically in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    cd backend
    npm test
    
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./backend/coverage/lcov.info
```

## Test Coverage Reports

After running tests with coverage, view the report:

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

Coverage reports show:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage
- Uncovered lines

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://testingjavascript.com/)

## Support

For testing issues or questions:
- Check existing test files for examples
- Review Jest documentation
- Open an issue on GitHub
- Contact the development team
