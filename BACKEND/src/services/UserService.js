const UserRepository = require('../repositories/UserRepository');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { setTimeout: delay } = require('timers/promises');

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  // User validation methods
  validateUserData(userData) {
    const errors = [];

    if (!userData.firstName || userData.firstName.trim().length === 0) {
      errors.push('First name is required');
    }

    if (!userData.lastName || userData.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email is required');
    }

    if (!userData.role || !this.isValidRole(userData.role)) {
      errors.push('Valid role is required (admin, lecturer, instructor, to)');
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return errors;
  }

  validateUpdateData(updateData) {
    const errors = [];

    if (
      updateData.firstName !== undefined &&
      updateData.firstName.trim().length === 0
    ) {
      errors.push('First name cannot be empty');
    }

    if (
      updateData.lastName !== undefined &&
      updateData.lastName.trim().length === 0
    ) {
      errors.push('Last name cannot be empty');
    }

    if (
      updateData.email !== undefined &&
      !this.isValidEmail(updateData.email)
    ) {
      errors.push('Valid email is required');
    }

    if (updateData.role !== undefined && !this.isValidRole(updateData.role)) {
      errors.push('Valid role is required (admin, lecturer, instructor, to)');
    }

    if (updateData.password !== undefined && updateData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidRole(role) {
    const validRoles = ['admin', 'lecturer', 'instructor', 'to'];
    return validRoles.includes(role);
  }

  // Business logic methods
  async createUser(userData) {
    // Validate input data
    const validationErrors = this.validateUserData(userData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user
    return await this.userRepository.create(userData);
  }

  async getUserById(id) {
    if (!id) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUserByEmail(email) {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getAllUsers(includeAdmins = false) {
    if (includeAdmins) {
      return await this.userRepository.findAll();
    }
    return await this.userRepository.findNonAdminUsers();
  }

  async getUsersByRole(role) {
    if (!this.isValidRole(role)) {
      throw new Error('Invalid role specified');
    }

    return await this.userRepository.findByRole(role);
  }

  async updateUser(id, updateData) {
    if (!id) {
      throw new Error('User ID is required');
    }

    // Validate update data
    const validationErrors = this.validateUpdateData(updateData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check if user exists
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check for email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(
        updateData.email,
      );
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    return await this.userRepository.update(id, updateData);
  }

  async updateUserName(id, firstName, lastName) {
    if (!id) {
      throw new Error('User ID is required');
    }

    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name is required');
    }

    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    return await this.userRepository.update(id, { firstName, lastName });
  }

  async updatePassword(email, newPassword) {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await this.userRepository.updateByEmail(email, {
      password: hashedPassword,
    });
  }

  async deleteUser(id) {
    if (!id) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return await this.userRepository.delete(id);
  }

  // OTP related methods
  async generateAndSaveOtp(email) {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    await this.userRepository.updateOtp(email, otp);

    // Schedule OTP removal after 5 minutes
    delay(5 * 60 * 1000).then(async () => {
      try {
        await this.userRepository.clearOtp(email);
        console.log(`OTP removed for ${email} after 5 minutes.`);
      } catch (error) {
        console.error('Failed to remove OTP after delay:', error);
      }
    });

    return { otp, user };
  }

  async verifyOtp(email, otp) {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    if (!otp) {
      throw new Error('OTP is required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    return user;
  }

  // Authorization helpers
  async checkUserExists(id) {
    return (await this.userRepository.findById(id)) !== null;
  }

  async getUserCount(role = null) {
    const filters = role ? { role } : {};
    return await this.userRepository.count(filters);
  }

  // Role-based queries
  async getLecturers() {
    return await this.getUsersByRole('lecturer');
  }

  async getInstructors() {
    return await this.getUsersByRole('instructor');
  }

  async getTechnicalOfficers() {
    return await this.getUsersByRole('to');
  }

  async getAdmins() {
    return await this.getUsersByRole('admin');
  }
}

module.exports = UserService;
