// tests/user.test.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');  

describe('User Model Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Schema Validation', () => {
    test('should throw validation error if required fields are missing', async () => {
      const user = new User({});
      let err;

      try {
        await user.validate();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.firstName).toBeDefined();
      expect(err.errors.lastName).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.role).toBeDefined();
      expect(err.errors.password).toBeDefined();
    });

    test('should only accept valid enum values for role field', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'invalidRole',
        password: 'password123'
      });
      let err;

      try {
        await user.validate();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.role).toBeDefined();
    });

    test('should throw validation error if email is not unique', async () => {
      await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        role: 'lecturer',
        password: 'password123'
      });

      const user = new User({
        firstName: 'John',
        lastName: 'Smith',
        email: 'jane.doe@example.com',  // Duplicate email
        role: 'lecturer',
        password: 'password123'
      });
      let err;

      try {
        await user.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.code).toBe(11000);  // Duplicate key error code
    });
  });

  describe('Password Hashing', () => {
    test('should hash the password before saving', async () => {
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'lecturer',
        password: 'password123'
      });

      const saveSpy = jest.spyOn(user, 'save');

      await user.save();

      expect(saveSpy).toHaveBeenCalled();
      expect(user.password).not.toBe('password123');
      const isMatch = await bcrypt.compare('password123', user.password);
      expect(isMatch).toBe(true);
    });
  });
});