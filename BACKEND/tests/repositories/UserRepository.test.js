const UserRepository = require('../../src/repositories/UserRepository');
const User = require('../../src/models/user');

// Mock the User model
jest.mock('../../src/models/user');

describe('UserRepository', () => {
  let userRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = new UserRepository();
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'lecturer',
        password: 'password123'
      };

      const mockUser = {
        ...userData,
        _id: 'user123',
        save: jest.fn().mockResolvedValue(userData)
      };

      User.mockImplementation(() => mockUser);

      const result = await userRepository.create(userData);

      expect(User).toHaveBeenCalledWith(userData);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(userData);
    });
  });

  describe('findById', () => {
    it('should find user by ID without password', async () => {
      const mockUser = { _id: 'user123', firstName: 'John', lastName: 'Doe' };
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findById.mockReturnValue({ select: mockSelect });

      const result = await userRepository.findById('user123');

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByIdWithPassword', () => {
    it('should find user by ID with password', async () => {
      const mockUser = { _id: 'user123', firstName: 'John', password: 'hashedPassword' };
      User.findById.mockResolvedValue(mockUser);

      const result = await userRepository.findByIdWithPassword('user123');

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = { _id: 'user123', email: 'john@example.com' };
      User.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('john@example.com');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should find all users with filters', async () => {
      const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];
      const mockSelect = jest.fn().mockResolvedValue(mockUsers);
      User.find.mockReturnValue({ select: mockSelect });

      const result = await userRepository.findAll({ role: 'lecturer' });

      expect(User.find).toHaveBeenCalledWith({ role: 'lecturer' });
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUsers);
    });

    it('should find all users without filters', async () => {
      const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];
      const mockSelect = jest.fn().mockResolvedValue(mockUsers);
      User.find.mockReturnValue({ select: mockSelect });

      const result = await userRepository.findAll();

      expect(User.find).toHaveBeenCalledWith({});
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findByRole', () => {
    it('should find users by role', async () => {
      const mockUsers = [{ _id: 'user1', role: 'lecturer' }];
      const mockSelect = jest.fn().mockResolvedValue(mockUsers);
      User.find.mockReturnValue({ select: mockSelect });

      const result = await userRepository.findByRole('lecturer');

      expect(User.find).toHaveBeenCalledWith({ role: 'lecturer' });
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findNonAdminUsers', () => {
    it('should find non-admin users', async () => {
      const mockUsers = [{ _id: 'user1', role: 'lecturer' }];
      const mockSelect = jest.fn().mockResolvedValue(mockUsers);
      User.find.mockReturnValue({ select: mockSelect });

      const result = await userRepository.findNonAdminUsers();

      expect(User.find).toHaveBeenCalledWith({ role: { $ne: 'admin' } });
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUsers);
    });
  });

  describe('update', () => {
    it('should update user and return updated user without password', async () => {
      const updateData = { firstName: 'Jane' };
      const mockUser = { _id: 'user123', firstName: 'Jane' };
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      const result = await userRepository.update('user123', updateData);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user123', updateData, { new: true });
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateByEmail', () => {
    it('should update user by email', async () => {
      const updateData = { firstName: 'Jane' };
      const mockUser = { _id: 'user123', firstName: 'Jane' };
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOneAndUpdate.mockReturnValue({ select: mockSelect });

      const result = await userRepository.updateByEmail('john@example.com', updateData);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: 'john@example.com' }, 
        updateData, 
        { new: true }
      );
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUser);
    });
  });

  describe('delete', () => {
    it('should delete user by ID', async () => {
      const mockUser = { _id: 'user123', firstName: 'John' };
      User.findByIdAndDelete.mockResolvedValue(mockUser);

      const result = await userRepository.delete('user123');

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateOtp', () => {
    it('should update OTP for user', async () => {
      const mockUser = { _id: 'user123', otp: '123456' };
      User.findOneAndUpdate.mockResolvedValue(mockUser);

      const result = await userRepository.updateOtp('john@example.com', '123456');

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: 'john@example.com' }, 
        { otp: '123456' }, 
        { new: true }
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('clearOtp', () => {
    it('should clear OTP for user', async () => {
      const mockUser = { _id: 'user123', otp: '' };
      User.findOneAndUpdate.mockResolvedValue(mockUser);

      const result = await userRepository.clearOtp('john@example.com');

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: 'john@example.com' }, 
        { otp: '' }, 
        { new: true }
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('exists', () => {
    it('should return true if user exists', async () => {
      User.findOne.mockResolvedValue({ _id: 'user123' });

      const result = await userRepository.exists('john@example.com');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await userRepository.exists('john@example.com');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should count users with filters', async () => {
      User.countDocuments.mockResolvedValue(5);

      const result = await userRepository.count({ role: 'lecturer' });

      expect(User.countDocuments).toHaveBeenCalledWith({ role: 'lecturer' });
      expect(result).toBe(5);
    });

    it('should count all users without filters', async () => {
      User.countDocuments.mockResolvedValue(10);

      const result = await userRepository.count();

      expect(User.countDocuments).toHaveBeenCalledWith({});
      expect(result).toBe(10);
    });
  });
});