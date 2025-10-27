const AuthService = require('../../src/services/AuthService');
const User = require('../../src/models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the User model
jest.mock('../../src/models/user');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        password: 'hashedPassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-token');

      const result = await AuthService.login('test@example.com', 'password123');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(result).toEqual({
        token: 'mock-token',
        user: {
          id: 'user123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'student'
        }
      });
    });

    it('should throw error when email or password is missing', async () => {
      await expect(AuthService.login('', 'password')).rejects.toThrow('Email and password are required');
      await expect(AuthService.login('email@test.com', '')).rejects.toThrow('Email and password are required');
    });

    it('should throw error when user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(AuthService.login('test@example.com', 'password123'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw error when password is invalid', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(AuthService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid email or password');
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      };

      const mockUser = {
        _id: 'user123',
        ...userData,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(null); // No existing user
      User.mockImplementation(() => mockUser);
      jwt.sign.mockReturnValue('mock-token');

      const result = await AuthService.register(userData);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual({
        token: 'mock-token',
        user: {
          id: 'user123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'student'
        }
      });
    });

    it('should throw error when required fields are missing', async () => {
      const incompleteData = {
        firstName: 'John',
        email: 'test@example.com'
        // Missing lastName, password, role
      };

      await expect(AuthService.register(incompleteData))
        .rejects.toThrow('All fields are required');
    });

    it('should throw error when user already exists', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      };

      User.findOne.mockResolvedValue({ email: 'test@example.com' }); // Existing user

      await expect(AuthService.register(userData))
        .rejects.toThrow('User with this email already exists');
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh a valid token', async () => {
      const mockDecoded = { _id: 'user123' };
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      jwt.verify.mockReturnValue(mockDecoded);
      User.findById.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('new-mock-token');

      const result = await AuthService.refreshToken('old-token');

      expect(jwt.verify).toHaveBeenCalledWith('old-token', 'test-secret');
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(result).toEqual({
        token: 'new-mock-token',
        user: {
          id: 'user123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'student'
        }
      });
    });

    it('should throw error when token is invalid', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(AuthService.refreshToken('invalid-token'))
        .rejects.toThrow('Invalid or expired token');
    });

    it('should throw error when user is not found', async () => {
      const mockDecoded = { _id: 'user123' };
      
      jwt.verify.mockReturnValue(mockDecoded);
      User.findById.mockResolvedValue(null);

      await expect(AuthService.refreshToken('valid-token'))
        .rejects.toThrow('User not found');
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await AuthService.logout('user123');
      
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token with correct payload', () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'student'
      };

      jwt.sign.mockReturnValue('generated-token');

      const token = AuthService.generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          _id: 'user123',
          email: 'test@example.com',
          role: 'student'
        },
        'test-secret',
        { expiresIn: '3d' }
      );
      expect(token).toBe('generated-token');
    });
  });

  describe('verifyToken', () => {
    it('should successfully verify a valid token', () => {
      const mockDecoded = { _id: 'user123', email: 'test@example.com' };
      jwt.verify.mockReturnValue(mockDecoded);

      const result = AuthService.verifyToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(result).toEqual(mockDecoded);
    });

    it('should throw error for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => AuthService.verifyToken('invalid-token'))
        .toThrow('Invalid or expired token');
    });
  });
});