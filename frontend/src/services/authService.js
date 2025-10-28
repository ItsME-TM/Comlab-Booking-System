import apiClient from './apiClient';

/**
 * Authentication service for handling user authentication operations
 */
class AuthService {
  /**
   * Login user with credentials
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login response with user data and token
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      // Store token if provided
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @param {string} userData.role - User role
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Logout current user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return response;
    } catch (error) {
      // Even if API call fails, clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error(error.message || 'Logout failed');
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} Refresh response with new token
   */
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh');
      
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Password reset response
   */
  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Password reset request failed');
    }
  }

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.token - Reset token
   * @param {string} resetData.password - New password
   * @returns {Promise<Object>} Password reset response
   */
  async resetPassword(resetData) {
    try {
      const response = await apiClient.post('/auth/reset-password', resetData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  /**
   * Verify authentication token
   * @returns {Promise<Object>} Token verification response
   */
  async verifyToken() {
    try {
      const response = await apiClient.get('/auth/verify');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Token verification failed');
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user profile');
    }
  }
}

// Export singleton instance
export default new AuthService();