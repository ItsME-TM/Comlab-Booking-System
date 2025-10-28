const UserRepository = require('../repositories/UserRepository');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { setTimeout: delay } = require('timers/promises');

/**
 * Service class for managing user operations
 * Handles business logic for user creation, updates, and authentication
 */
class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Validate user data for creation
   * @param {Object} userData - User data to validate
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.email - User's email address
   * @param {string} userData.role - User's role
   * @param {string} userData.password - User's password
   * @returns {Array<string>} Array of validation error messages
   */
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

  /**
   * Validate user data for updates
   * @param {Object} updateData - Update data to validate
   * @param {string} [updateData.firstName] - Updated first name
   * @param {string} [updateData.lastName] - Updated last name
   * @param {string} [updateData.email] - Updated email
   * @param {string} [updateData.role] - Updated role
   * @param {string} [updateData.password] - Updated password
   * @returns {Array<string>} Array of validation error messages
   */
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

  /**
   * Validate email format
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email format is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if a role is valid
   * @param {string} role - Role to validate
   * @returns {boolean} True if role is valid
   */
  isValidRole(role) {
    const validRoles = ['admin', 'lecturer', 'instructor', 'to'];
    return validRoles.includes(role);
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @param {string} userData.email - User's email address
   * @param {string} userData.role - User's role
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} Created user object
   * @throws {Error} If validation fails or user already exists
   */
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

  /**
   * Get a user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User object
   * @throws {Error} If user not found
   */
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

  /**
   * Get a user by email address
   * @param {string} email - User's email address
   * @returns {Promise<Object>} User object
   * @throws {Error} If email is invalid or user not found
   */
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

  /**
   * Get all users
   * @param {boolean} [includeAdmins=false] - Whether to include admin users
   * @returns {Promise<Array<Object>>} Array of user objects
   */
  async getAllUsers(includeAdmins = false) {
    if (includeAdmins) {
      return await this.userRepository.findAll();
    }
    return await this.userRepository.findNonAdminUsers();
  }

  /**
   * Get users by role
   * @param {string} role - User role to filter by
   * @returns {Promise<Array<Object>>} Array of user objects
   * @throws {Error} If role is invalid
   */
  async getUsersByRole(role) {
    if (!this.isValidRole(role)) {
      throw new Error('Invalid role specified');
    }

    return await this.userRepository.findByRole(role);
  }

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.firstName] - Updated first name
   * @param {string} [updateData.lastName] - Updated last name
   * @param {string} [updateData.email] - Updated email
   * @param {string} [updateData.role] - Updated role
   * @param {string} [updateData.password] - Updated password
   * @returns {Promise<Object>} Updated user object
   * @throws {Error} If validation fails, user not found, or email already exists
   */
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

  /**
   * Update user's name
   * @param {string} id - User ID
   * @param {string} firstName - New first name
   * @param {string} lastName - New last name
   * @returns {Promise<Object>} Updated user object
   * @throws {Error} If user not found or names are invalid
   */
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

  /**
   * Update user's password
   * @param {string} email - User's email address
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Updated user object
   * @throws {Error} If email is invalid, user not found, or password is too short
   */
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

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<Object>} Deleted user object
   * @throws {Error} If user not found
   */
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

  /**
   * Generate and save OTP for password reset
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Object containing OTP and user data
   * @throws {Error} If email is invalid or user not found
   */
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

  /**
   * Verify OTP for password reset
   * @param {string} email - User's email address
   * @param {string} otp - OTP to verify
   * @returns {Promise<Object>} User object if OTP is valid
   * @throws {Error} If email is invalid, user not found, or OTP is invalid
   */
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

  /**
   * Check if a user exists
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if user exists
   */
  async checkUserExists(id) {
    return (await this.userRepository.findById(id)) !== null;
  }

  /**
   * Get count of users
   * @param {string} [role=null] - Optional role filter
   * @returns {Promise<number>} Count of users
   */
  async getUserCount(role = null) {
    const filters = role ? { role } : {};
    return await this.userRepository.count(filters);
  }

  /**
   * Get all lecturers
   * @returns {Promise<Array<Object>>} Array of lecturer user objects
   */
  async getLecturers() {
    return await this.getUsersByRole('lecturer');
  }

  /**
   * Get all instructors
   * @returns {Promise<Array<Object>>} Array of instructor user objects
   */
  async getInstructors() {
    return await this.getUsersByRole('instructor');
  }

  /**
   * Get all technical officers
   * @returns {Promise<Array<Object>>} Array of technical officer user objects
   */
  async getTechnicalOfficers() {
    return await this.getUsersByRole('to');
  }

  /**
   * Get all administrators
   * @returns {Promise<Array<Object>>} Array of admin user objects
   */
  async getAdmins() {
    return await this.getUsersByRole('admin');
  }
}

module.exports = UserService;
