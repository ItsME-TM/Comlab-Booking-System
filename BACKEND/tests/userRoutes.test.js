// tests/userRoutes.test.js
const request = require('supertest');
const express = require('express');
const User = require('../models/user');  
const auth = require('../middleware/auth');  
const bcrypt = require('bcryptjs');
const userRoutes = require('../routes/userRoutes');  

jest.mock('../models/user');  
jest.mock('../middleware/auth');  
jest.mock('bcryptjs');

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('User Routes Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockImplementation((req, res, next) => {
      req.user = { role: 'admin' };  // Mock user role
      next();
    });
  });

  describe('POST /add', () => {
    test('should return 403 if user is not an admin', async () => {
      auth.mockImplementation((req, res, next) => {
        req.user = { role: 'lecturer' };  // Mock user role
        next();
      });

      const response = await request(app).post('/users/add').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'lecturer',
        password: 'password123'
      });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: "Access denied. You're not an admin." });
    });

    test('should add a new user if user is an admin', async () => {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'lecturer',
        password: 'hashedpassword'
      };

      bcrypt.hash.mockResolvedValue('hashedpassword');
      User.prototype.save = jest.fn().mockResolvedValue(user);

      const response = await request(app).post('/users/add').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'lecturer',
        password: 'password123'
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User added successfully' });
    });

    test('should return 500 if there is a server error', async () => {
      User.prototype.save = jest.fn().mockRejectedValue(new Error('Server error'));

      const response = await request(app).post('/users/add').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'lecturer',
        password: 'password123'
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('GET /getall', () => {
    test('should return 403 if user is not an admin', async () => {
      auth.mockImplementation((req, res, next) => {
        req.user = { role: 'lecturer' };  // Mock user role
        next();
      });

      const response = await request(app).get('/users/getall');

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: "Access denied. You're not an admin." });
    });

    test('should get all users if user is an admin', async () => {
      const users = [
        { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', role: 'lecturer' },
        { firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', role: 'instructor' }
      ];

      User.find.mockResolvedValue(users);

      const response = await request(app).get('/users/getall');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(users);
    });

    test('should return 500 if there is a server error', async () => {
      User.find.mockRejectedValue(new Error('Server error'));

      const response = await request(app).get('/users/getall');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  // Similar tests for GET /lecturers, GET /tos, GET /instructors, GET /:id, DELETE /:id, PUT /:id

  describe('PUT /:id', () => {
    test('should update the user if user is an admin', async () => {
      const updatedUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'lecturer',
        password: 'newhashedpassword'
      };

      bcrypt.hash.mockResolvedValue('newhashedpassword');
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const response = await request(app).put('/users/12345').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'lecturer',
        password: 'newpassword123'
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User updated successfully', updateUser: updatedUser });
    });

    test('should return 500 if there is a server error', async () => {
      User.findByIdAndUpdate.mockRejectedValue(new Error('Server error'));

      const response = await request(app).put('/users/12345').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'lecturer',
        password: 'newpassword123'
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('DELETE /:id', () => {
    test('should delete the user if user is an admin', async () => {
      const user = {
        _id: '12345',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'lecturer'
      };

      User.findByIdAndDelete.mockResolvedValue(user);

      const response = await request(app).delete('/users/12345');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'User deleted successfully' });
    });

    test('should return 404 if user not found', async () => {
      User.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app).delete('/users/12345');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    test('should return 500 if there is a server error', async () => {
      User.findByIdAndDelete.mockRejectedValue(new Error('Server error'));

      const response = await request(app).delete('/users/12345');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });
});