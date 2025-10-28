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

  const value = {
    ...state,
    setUser,
    updateUser,
    clearUser,
    setLoading,
    setError,
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
