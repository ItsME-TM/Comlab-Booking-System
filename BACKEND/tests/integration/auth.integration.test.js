// Mock nodemailer before importing app
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

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const DbHelper = require('../helpers/dbHelper');

describe('Authentication Integration Tests', () => {
  beforeEach(async () => {
    await DbHelper.clearAllCollections();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        department: 'Computer Science',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
      expect(response.body.user.lastName).toBe(userData.lastName);
      expect(response.body.user.role).toBe(userData.role);

      // Verify user was created in database
      const userInDb = await User.findOne({ email: userData.email });
      expect(userInDb).toBeTruthy();
      expect(userInDb.email).toBe(userData.email);
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
      };

      // Create first user
      await DbHelper.createTestData(User, userData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const userData = {
        email: 'login@example.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'User',
        role: 'student',
      };

      await request(app).post('/api/auth/register').send(userData);
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should not login with non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let validToken;

    beforeEach(async () => {
      // Register and login to get a valid token
      const userData = {
        email: 'refresh@example.com',
        password: 'password123',
        firstName: 'Refresh',
        lastName: 'User',
        role: 'student',
      };

      await request(app).post('/api/auth/register').send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });

      validToken = loginResponse.body.token;
    });

    it('should refresh token with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeTruthy();
      expect(response.body.token).not.toBe(validToken); // Should be a new token
    });

    it('should not refresh token without authorization header', async () => {
      const response = await request(app).post('/api/auth/refresh').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let validToken;
    let userId;

    beforeEach(async () => {
      // Register and login to get a valid token
      const userData = {
        email: 'logout@example.com',
        password: 'password123',
        firstName: 'Logout',
        lastName: 'User',
        role: 'student',
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      userId = registerResponse.body.user.id;

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });

      validToken = loginResponse.body.token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ userId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out');
    });

    it('should not logout without authorization header', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ userId })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
