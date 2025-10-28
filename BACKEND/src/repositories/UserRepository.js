const User = require('../models/user');

/**
 * Repository class for user data access
 * Handles all database operations for users
 */
class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user document
   */
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User document (without password) or null
   */
  async findById(id) {
    return await User.findById(id).select('-password');
  }

  /**
   * Find a user by ID including password
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User document with password or null
   */
  async findByIdWithPassword(id) {
    return await User.findById(id);
  }

  /**
   * Find a user by email
   * @param {string} email - User's email address
   * @returns {Promise<Object|null>} User document or null
   */
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  /**
   * Find all users matching filters
   * @param {Object} [filters={}] - MongoDB query filters
   * @returns {Promise<Array<Object>>} Array of user documents (without passwords)
   */
  async findAll(filters = {}) {
    return await User.find(filters).select('-password');
  }

  /**
   * Find users by role
   * @param {string} role - User role
   * @returns {Promise<Array<Object>>} Array of user documents (without passwords)
   */
  async findByRole(role) {
    return await User.find({ role }).select('-password');
  }

  /**
   * Find all non-admin users
   * @returns {Promise<Array<Object>>} Array of user documents (without passwords)
   */
  async findNonAdminUsers() {
    return await User.find({ role: { $ne: 'admin' } }).select('-password');
  }

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated user document (without password) or null
   */
  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true }).select(
      '-password',
    );
  }

  /**
   * Update a user by email
   * @param {string} email - User's email address
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated user document (without password) or null
   */
  async updateByEmail(email, updateData) {
    return await User.findOneAndUpdate({ email }, updateData, {
      new: true,
    }).select('-password');
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} Deleted user document or null
   */
  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  /**
   * Update user's OTP
   * @param {string} email - User's email address
   * @param {string} otp - One-time password
   * @returns {Promise<Object|null>} Updated user document or null
   */
  async updateOtp(email, otp) {
    return await User.findOneAndUpdate({ email }, { otp }, { new: true });
  }

  /**
   * Clear user's OTP
   * @param {string} email - User's email address
   * @returns {Promise<Object|null>} Updated user document or null
   */
  async clearOtp(email) {
    return await User.findOneAndUpdate({ email }, { otp: '' }, { new: true });
  }

  /**
   * Check if a user exists by email
   * @param {string} email - User's email address
   * @returns {Promise<boolean>} True if user exists
   */
  async exists(email) {
    const user = await User.findOne({ email });
    return !!user;
  }

  /**
   * Count users matching filters
   * @param {Object} [filters={}] - MongoDB query filters
   * @returns {Promise<number>} Count of matching users
   */
  async count(filters = {}) {
    return await User.countDocuments(filters);
  }
}

module.exports = UserRepository;
