import React, { createContext, useContext, useReducer, useEffect } from 'react';

// User action types
const USER_ACTIONS = {
  SET_USER: 'SET_USER',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_USER: 'CLEAR_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// User reducer
const userReducer = (state, action) => {
  switch (action.type) {
    case USER_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case USER_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null,
      };
    case USER_ACTIONS.CLEAR_USER:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
      };
    case USER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case USER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Create context
const UserContext = createContext();

// User provider component
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: USER_ACTIONS.SET_USER, payload: user });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Actions
  const setUser = user => {
    dispatch({ type: USER_ACTIONS.SET_USER, payload: user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  const updateUser = updates => {
    dispatch({ type: USER_ACTIONS.UPDATE_USER, payload: updates });
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const clearUser = () => {
    dispatch({ type: USER_ACTIONS.CLEAR_USER });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const setLoading = loading => {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = error => {
    dispatch({ type: USER_ACTIONS.SET_ERROR, payload: error });
  };

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   */
  const updateProfile = async profileData => {
    try {
      setLoading(true);
      // Import userService dynamically to avoid circular dependencies
      const { userService } = await import('../services');
      const updatedUser = await userService.updateProfile(profileData);
      updateUser(updatedUser);
      setLoading(false);
      return { success: true, user: updatedUser };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} Result with success status
   */
  const refreshToken = async () => {
    try {
      setLoading(true);
      const { authService } = await import('../services');
      const response = await authService.refreshToken();
      
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      // If token refresh fails, clear user data
      clearUser();
      return { success: false, error: error.message };
    }
  };

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  const hasRole = role => {
    return state.user?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   * @param {Array<string>} roles - Array of roles to check
   * @returns {boolean} True if user has any of the roles
   */
  const hasAnyRole = roles => {
    return roles.includes(state.user?.role);
  };

  /**
   * Check if user has all of the specified roles
   * @param {Array<string>} roles - Array of roles to check
   * @returns {boolean} True if user has all of the roles
   */
  const hasAllRoles = roles => {
    return roles.every(role => state.user?.role === role);
  };

  /**
   * Check if user is admin
   * @returns {boolean} True if user is admin
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  /**
   * Check if user is lecturer
   * @returns {boolean} True if user is lecturer
   */
  const isLecturer = () => {
    return hasRole('lecturer');
  };

  /**
   * Check if user is instructor
   * @returns {boolean} True if user is instructor
   */
  const isInstructor = () => {
    return hasRole('instructor');
  };

  /**
   * Check if user is technical officer
   * @returns {boolean} True if user is technical officer
   */
  const isTechnicalOfficer = () => {
    return hasRole('to');
  };

  /**
   * Check if user can manage users (admin only)
   * @returns {boolean} True if user can manage users
   */
  const canManageUsers = () => {
    return isAdmin();
  };

  /**
   * Check if user can create bookings
   * @returns {boolean} True if user can create bookings
   */
  const canCreateBookings = () => {
    return hasAnyRole(['lecturer', 'instructor', 'to']);
  };

  /**
   * Check if user can approve bookings (TO only)
   * @returns {boolean} True if user can approve bookings
   */
  const canApproveBookings = () => {
    return isTechnicalOfficer();
  };

  /**
   * Check if user can view all bookings
   * @returns {boolean} True if user can view all bookings
   */
  const canViewAllBookings = () => {
    return hasAnyRole(['admin', 'to']);
  };

  /**
   * Get user's full name
   * @returns {string} User's full name
   */
  const getFullName = () => {
    if (!state.user) return '';
    return `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim();
  };

  /**
   * Get user's initials
   * @returns {string} User's initials
   */
  const getInitials = () => {
    if (!state.user) return '';
    const firstName = state.user.firstName || '';
    const lastName = state.user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const value = {
    ...state,
    setUser,
    updateUser,
    clearUser,
    setLoading,
    setError,
    updateProfile,
    refreshToken,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isLecturer,
    isInstructor,
    isTechnicalOfficer,
    canManageUsers,
    canCreateBookings,
    canApproveBookings,
    canViewAllBookings,
    getFullName,
    getInitials,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
