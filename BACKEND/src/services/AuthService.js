const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

class AuthService {
  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Authentication result with token and user data
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Registration result with token and user data
   */
  async register(userData) {
    const { firstName, lastName, email, password, role } = userData;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      throw new Error('All fields are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user (password will be hashed by the pre-save middleware)
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role
    });

    await user.save();

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  }

  /**
   * Refresh JWT token
   * @param {string} token - Current JWT token
   * @returns {Object} New token and user data
   */
  async refreshToken(token) {
    try {
      // Verify current token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user to ensure they still exist
      const user = await User.findById(decoded._id);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token
      const newToken = this.generateToken(user);

      return {
        token: newToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Logout user (token invalidation would be handled by client-side token removal)
   * @param {string} userId - User ID
   * @returns {Object} Logout confirmation
   */
  async logout(userId) {
    // In a stateless JWT system, logout is typically handled client-side
    // This method can be used for logging or cleanup if needed
    return { message: 'Logged out successfully' };
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3d' });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();