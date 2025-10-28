import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Notification action types
const NOTIFICATION_ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  CLEAR_ALL: 'CLEAR_ALL',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  BOOKING: 'booking',
  SYSTEM: 'system'
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null
};

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      const newNotification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isRead: false,
        ...action.payload
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      const removedNotification = state.notifications.find(
        notification => notification.id === action.payload
      );
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: removedNotification && !removedNotification.isRead 
          ? state.unreadCount - 1 
          : state.unreadCount
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, isRead: true }
          : notification
      );
      const wasUnread = state.notifications.find(
        notification => notification.id === action.payload && !notification.isRead
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.CLEAR_ALL:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      const unreadCount = action.payload.filter(notification => !notification.isRead).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount
      };

    case NOTIFICATION_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case NOTIFICATION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Actions
  const addNotification = useCallback((notification) => {
    dispatch({ type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION, payload: notification });
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION, payload: id });
  }, []);

  const markAsRead = useCallback((id) => {
    dispatch({ type: NOTIFICATION_ACTIONS.MARK_AS_READ, payload: id });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ALL });
  }, []);

  const setNotifications = useCallback((notifications) => {
    dispatch({ type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS, payload: notifications });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error });
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, title = 'Success') => {
    addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message
    });
  }, [addNotification]);

  const showError = useCallback((message, title = 'Error') => {
    addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title,
      message
    });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning') => {
    addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title,
      message
    });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Info') => {
    addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message
    });
  }, [addNotification]);

  const value = {
    ...state,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    setNotifications,
    setLoading,
    setError,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;