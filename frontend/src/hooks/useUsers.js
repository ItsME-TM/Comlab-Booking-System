import { useState, useCallback } from 'react';
import { userService } from '../services';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Custom hook for user management operations
 * @returns {Object} User management state and methods
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();

  /**
   * Fetch all users
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchUsers = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUsers(filters);
        setUsers(data);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch users';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Fetch all users (legacy endpoint)
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch users';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Fetch user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result with success status and user data
   */
  const fetchUserById = useCallback(
    async userId => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUserById(userId);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch user';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Fetch user details by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result with success status and user details
   */
  const fetchUserDetails = useCallback(
    async userId => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUserDetails(userId);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch user details';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Fetch users by role
   * @param {string} role - User role
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchUsersByRole = useCallback(
    async role => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUsersByRole(role);
        setUsers(data);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch users by role';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Fetch user names and emails
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchUserNames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserNames();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch user names';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Fetch lecturers
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchLecturers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getLecturers();
      setUsers(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch lecturers';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Fetch technical officers
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchTechnicalOfficers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getTechnicalOfficers();
      setUsers(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch technical officers';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Fetch instructors
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchInstructors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getInstructors();
      setUsers(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch instructors';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Fetch current authenticated user
   * @returns {Promise<Object>} Result with success status and user data
   */
  const fetchTokenUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getTokenUser();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch token user';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Result with success status and created user
   */
  const createUser = useCallback(
    async userData => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.createUser(userData);
        showSuccess('User created successfully');
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to create user';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Add new user (legacy endpoint)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Result with success status and created user
   */
  const addUser = useCallback(
    async userData => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.addUser(userData);
        showSuccess('User added successfully');
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to add user';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updates - User updates
   * @returns {Promise<Object>} Result with success status and updated user
   */
  const updateUser = useCallback(
    async (userId, updates) => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.updateUser(userId, updates);
        showSuccess('User updated successfully');
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to update user';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Update user name
   * @param {string} userId - User ID
   * @param {Object} nameData - Name data
   * @returns {Promise<Object>} Result with success status
   */
  const updateUserName = useCallback(
    async (userId, nameData) => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.updateUserName(userId, nameData);
        showSuccess('User name updated successfully');
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to update user name';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result with success status
   */
  const deleteUser = useCallback(
    async userId => {
      try {
        setLoading(true);
        setError(null);
        await userService.deleteUser(userId);
        setUsers(prev => prev.filter(u => u._id !== userId));
        showSuccess('User deleted successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete user';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Update user profile
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} Result with success status
   */
  const updateProfile = useCallback(
    async profileData => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.updateProfile(profileData);
        showSuccess('Profile updated successfully');
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to update profile';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Result with success status
   */
  const changePassword = useCallback(
    async passwordData => {
      try {
        setLoading(true);
        setError(null);
        await userService.changePassword(passwordData);
        showSuccess('Password changed successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to change password';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Update user password
   * @param {Object} passwordData - Password data
   * @returns {Promise<Object>} Result with success status
   */
  const updatePassword = useCallback(
    async passwordData => {
      try {
        setLoading(true);
        setError(null);
        await userService.updatePassword(passwordData);
        showSuccess('Password updated successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to update password';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Verify email and send OTP
   * @param {string} email - User email
   * @returns {Promise<Object>} Result with success status and OTP data
   */
  const verifyEmail = useCallback(
    async email => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.verifyEmail(email);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to verify email';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Upload user avatar
   * @param {File} file - Avatar file
   * @returns {Promise<Object>} Result with success status
   */
  const uploadAvatar = useCallback(
    async file => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.uploadAvatar(file);
        showSuccess('Avatar uploaded successfully');
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to upload avatar';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Set user status (activate/deactivate)
   * @param {string} userId - User ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>} Result with success status
   */
  const setUserStatus = useCallback(
    async (userId, isActive) => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.setUserStatus(userId, isActive);
        showSuccess(
          `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        );
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to update user status';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchAllUsers,
    fetchUserById,
    fetchUserDetails,
    fetchUsersByRole,
    fetchUserNames,
    fetchLecturers,
    fetchTechnicalOfficers,
    fetchInstructors,
    fetchTokenUser,
    createUser,
    addUser,
    updateUser,
    updateUserName,
    deleteUser,
    updateProfile,
    changePassword,
    updatePassword,
    verifyEmail,
    uploadAvatar,
    setUserStatus,
  };
};
