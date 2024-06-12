// tests/authrouter.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');  
const authRouter = require('../routes/authRouter');  

jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('../models/user');  

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Router Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if email is invalid', async () => {
    User.findOne.mockResolvedValue(null);
    const response = await request(app).post('/auth/login').send({ email: 'invalid@example.com', password: 'password123' });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid email or password' });
  });

  test('should return 400 if password is invalid', async () => {
    const user = { email: 'valid@example.com', password: 'hashedpassword' };
    User.findOne.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);
    const response = await request(app).post('/auth/login').send({ email: 'valid@example.com', password: 'wrongpassword' });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid email or password' });
  });

  test('should return a token if login is successful', async () => {
    const user = { _id: 'userId', email: 'valid@example.com', password: 'hashedpassword', role: 'user' };
    User.findOne.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    const token = 'validtoken';
    jwt.sign.mockReturnValue(token);

    const response = await request(app).post('/auth/login').send({ email: 'valid@example.com', password: 'password123' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token });
    expect(jwt.sign).toHaveBeenCalledWith({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });
});
