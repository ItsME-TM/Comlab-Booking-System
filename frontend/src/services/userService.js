import apiClient from './apiClient';

/**
 * User service for handling user management operations
 */
class UserService {
  /**
   * Get all users
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} List of users
   */
  async getUsers(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/users?${queryParams}` : '/users';
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch users');
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user');
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user data
   */
  async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create user');
    }
  }

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updates - User updates
   * @returns {Promise<Object>} Updated user data
   */
  async updateUser(userId, updates) {
    try {
      const response = await apiClient.put(`/users/${userId}`, updates);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update user');
    }
  }

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion response
   */
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} Updated profile data
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Password change response
   */
  async changePassword(passwordData) {
    try {
      const response = await apiClient.put(
        '/users/change-password',
        passwordData,
      );
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  }

  /**
   * Upload user avatar
   * @param {File} file - Avatar image file
   * @returns {Promise<Object>} Upload response
   */
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.request('/users/avatar', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary
        },
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to upload avatar');
    }
  }

  /**
   * Get users by role
   * @param {string} role - User role
   * @returns {Promise<Array>} List of users with specified role
   */
  async getUsersByRole(role) {
    try {
      const response = await apiClient.get(`/users?role=${role}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch users by role');
    }
  }

  /**
   * Activate/deactivate user
   * @param {string} userId - User ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>} Update response
   */
  async setUserStatus(userId, isActive) {
    try {
      const response = await apiClient.patch(`/users/${userId}/status`, {
        isActive,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update user status');
    }
  }
}

// Export singleton instance
export default new UserService();
