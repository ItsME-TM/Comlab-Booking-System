const UserService = require('../../src/services/UserService');
const UserRepository = require('../../src/repositories/UserRepository');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Mock dependencies
jest.mock('../../src/repositories/UserRepository');
jest.mock('bcrypt');
jest.mock('crypto');
jest.mock('timers/promises', () => ({
  setTimeout: jest.fn().mockResolvedValue()
}));

describe('UserService', () => {
  let userService;
  let mockUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
    mockUserRepository = userService.userRepository;
  });

  describe('validateUserData', () => {
    it('should return no errors for valid user data', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'lecturer',
        password: 'password123'
      };

      const errors = userService.validateUserData(userData);
      expect(errors).toEqual([]);
    });

    it('should return errors for invalid user data', () => {
      const userData = {
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        role: 'invalid-role',
        password: '123'
      };

      const errors = userService.validateUserData(userData);
      expect(errors).toContain('First name is required');
      expect(errors).toContain('Last name is required');
      expect(errors).toContain('Valid email is required');
      expect(errors).toContain('Valid role is required (admin, lecturer, instructor, to)');
      expect(errors).toContain('Password must be at least 6 characters long');
    });
  });

  describe('createUser', () => {
    it('should successfully create a user with valid data', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'lecturer',
        password: 'password123'
      };

      const mockCreatedUser = { _id: 'user123', ...userData };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.createUser(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockCreatedUser);
    });

    it('should throw error for invalid user data', async () => {
      const userData = {
        firstName: '',
        email: 'invalid-email'
      };

      await expect(userService.createUser(userData))
        .rejects.toThrow('Validation failed');
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'lecturer',
        password: 'password123'
      };

      mockUserRepository.findByEmail.mockResolvedValue({ email: 'john@example.com' });

      await expect(userService.createUser(userData))
        .rejects.toThrow('User with this email already exists');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = { _id: 'user123', firstName: 'John', lastName: 'Doe' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('user123'))
        .rejects.toThrow('User not found');
    });

    it('should throw error when ID is not provided', async () => {
      await expect(userService.getUserById(''))
        .rejects.toThrow('User ID is required');
    });
  });

  describe('updateUser', () => {
    it('should successfully update user with valid data', async () => {
      const updateData = { firstName: 'Jane', lastName: 'Smith' };
      const existingUser = { _id: 'user123', email: 'john@example.com' };
      const updatedUser = { _id: 'user123', firstName: 'Jane', lastName: 'Smith' };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('user123', updateData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
      expect(mockUserRepository.update).toHaveBeenCalledWith('user123', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should hash password when provided', async () => {
      const updateData = { password: 'newpassword123' };
      const existingUser = { _id: 'user123', email: 'john@example.com' };
      const hashedPassword = 'hashedPassword';

      mockUserRepository.findById.mockResolvedValue(existingUser);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.update.mockResolvedValue(existingUser);

      await userService.updateUser('user123', updateData);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith('user123', { password: hashedPassword });
    });

    it('should check email uniqueness when email is updated', async () => {
      const updateData = { email: 'newemail@example.com' };
      const existingUser = { _id: 'user123', email: 'john@example.com' };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue({ _id: 'other123' });

      await expect(userService.updateUser('user123', updateData))
        .rejects.toThrow('Email already exists');
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete existing user', async () => {
      const mockUser = { _id: 'user123', firstName: 'John' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(mockUser);

      const result = await userService.deleteUser('user123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user123');
      expect(mockUserRepository.delete).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser('user123'))
        .rejects.toThrow('User not found');
    });
  });

  describe('generateAndSaveOtp', () => {
    it('should generate OTP and save it for valid email', async () => {
      const email = 'john@example.com';
      const mockUser = { _id: 'user123', email };
      const mockOtp = '123456';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      crypto.randomInt.mockReturnValue(123456);
      mockUserRepository.updateOtp.mockResolvedValue(mockUser);

      const result = await userService.generateAndSaveOtp(email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(crypto.randomInt).toHaveBeenCalledWith(100000, 999999);
      expect(mockUserRepository.updateOtp).toHaveBeenCalledWith(email, mockOtp);
      expect(result).toEqual({ otp: mockOtp, user: mockUser });
    });

    it('should throw error for invalid email', async () => {
      await expect(userService.generateAndSaveOtp('invalid-email'))
        .rejects.toThrow('Valid email is required');
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.generateAndSaveOtp('john@example.com'))
        .rejects.toThrow('User not found');
    });
  });

  describe('role-based queries', () => {
    it('should get lecturers', async () => {
      const mockLecturers = [{ role: 'lecturer' }];
      mockUserRepository.findByRole.mockResolvedValue(mockLecturers);

      const result = await userService.getLecturers();

      expect(mockUserRepository.findByRole).toHaveBeenCalledWith('lecturer');
      expect(result).toEqual(mockLecturers);
    });

    it('should get instructors', async () => {
      const mockInstructors = [{ role: 'instructor' }];
      mockUserRepository.findByRole.mockResolvedValue(mockInstructors);

      const result = await userService.getInstructors();

      expect(mockUserRepository.findByRole).toHaveBeenCalledWith('instructor');
      expect(result).toEqual(mockInstructors);
    });

    it('should get technical officers', async () => {
      const mockTOs = [{ role: 'to' }];
      mockUserRepository.findByRole.mockResolvedValue(mockTOs);

      const result = await userService.getTechnicalOfficers();

      expect(mockUserRepository.findByRole).toHaveBeenCalledWith('to');
      expect(result).toEqual(mockTOs);
    });
  });

  describe('validation helpers', () => {
    it('should validate email correctly', () => {
      expect(userService.isValidEmail('test@example.com')).toBe(true);
      expect(userService.isValidEmail('invalid-email')).toBe(false);
      expect(userService.isValidEmail('')).toBe(false);
    });

    it('should validate role correctly', () => {
      expect(userService.isValidRole('admin')).toBe(true);
      expect(userService.isValidRole('lecturer')).toBe(true);
      expect(userService.isValidRole('instructor')).toBe(true);
      expect(userService.isValidRole('to')).toBe(true);
      expect(userService.isValidRole('invalid')).toBe(false);
    });
  });
});