const AuthService = require('../services/AuthService');

/**
 * Controller class for handling authentication operations
 * Manages HTTP requests for login, registration, token refresh, and logout
 */
class AuthController {
  /**
   * Handle user login
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.email - User email
   * @param {string} req.body.password - User password
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Handle user registration
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body with user data
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async register(req, res) {
    try {
      const userData = req.body;

      const result = await AuthService.register(userData);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Handle token refresh
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.token - Current JWT token
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required',
        });
      }

      const result = await AuthService.refreshToken(token);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Handle user logout
   * @param {Object} req - Express request object
   * @param {Object} req.user - Authenticated user from middleware
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async logout(req, res) {
    try {
      const userId = req.user?._id;

      const result = await AuthService.logout(userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();
