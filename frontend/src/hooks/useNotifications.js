import { useState, useCallback } from 'react';
import { notificationService } from '../services';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Custom hook for notification management operations
 * @returns {Object} Notification management state and methods
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();

  /**
   * Fetch all notifications
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchNotifications = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);
        const data = await notificationService.getNotifications(filters);
        setNotifications(data);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch notifications';
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
   * Fetch user receiver notifications (booking confirmations)
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchUserReceiverNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getUserReceiverNotifications();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch receiver notifications';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Fetch notification by ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Result with success status and notification data
   */
  const fetchNotificationById = useCallback(
    async notificationId => {
      try {
        setLoading(true);
        setError(null);
        const data = await notificationService.getNotificationById(notificationId);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch notification';
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
   * Fetch unread notification count
   * @returns {Promise<Object>} Result with success status and count data
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getUnreadCount();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch unread count';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Fetch attendees by booking ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Result with success status and attendees data
   */
  const fetchAttendeesByBookingId = useCallback(
    async bookingId => {
      try {
        setLoading(true);
        setError(null);
        const data = await notificationService.getAttendeesByBookingId(bookingId);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch attendees';
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
   * Create new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Result with success status and created notification
   */
  const createNotification = useCallback(
    async notificationData => {
      try {
        setLoading(true);
        setError(null);
        const data = await notificationService.createNotification(notificationData);
        showSuccess('Notification created successfully');
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to create notification';
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
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Result with success status
   */
  const markAsRead = useCallback(
    async notificationId => {
      try {
        setLoading(true);
        setError(null);
        await notificationService.markAsRead(notificationId);
        setNotifications(prev =>
          prev.map(n =>
            n._id === notificationId ? { ...n, isRead: true } : n,
          ),
        );
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to mark notification as read';
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
   * Mark all notifications as read
   * @returns {Promise<Object>} Result with success status
   */
  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showSuccess('All notifications marked as read');
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to mark all notifications as read';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  /**
   * Accept notification (confirm receiver)
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Result with success status
   */
  const acceptNotification = useCallback(
    async notificationId => {
      try {
        setLoading(true);
        setError(null);
        await notificationService.acceptNotification(notificationId);
        showSuccess('Notification accepted successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to accept notification';
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
   * Reject notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Result with success status
   */
  const rejectNotification = useCallback(
    async notificationId => {
      try {
        setLoading(true);
        setError(null);
        await notificationService.rejectNotification(notificationId);
        showSuccess('Notification rejected successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to reject notification';
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
   * Confirm lab booking
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Result with success status
   */
  const confirmLab = useCallback(
    async notificationId => {
      try {
        setLoading(true);
        setError(null);
        await notificationService.confirmLab(notificationId);
        showSuccess('Lab confirmed successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to confirm lab';
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
   * Cancel lab booking
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Result with success status
   */
  const cancelLab = useCallback(
    async notificationId => {
      try {
        setLoading(true);
        setError(null);
        await notificationService.cancelLab(notificationId);
        showSuccess('Lab cancelled successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to cancel lab';
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
   * Update notifications to reminder status
   * @returns {Promise<Object>} Result with success status
   */
  const updateNotificationsToReminder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await notificationService.updateNotificationsToReminder();
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update notifications to reminder';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Result with success status
   */
  const deleteNotification = useCallback(
    async notificationId => {
      try {
        setLoading(true);
        setError(null);
        await notificationService.deleteNotification(notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        showSuccess('Notification deleted successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete notification';
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
   * Delete all notifications
   * @returns {Promise<Object>} Result with success status
   */
  const deleteAllNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      showSuccess('All notifications deleted successfully');
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete all notifications';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  /**
   * Send email notification
   * @param {Object} emailData - Email notification data
   * @returns {Promise<Object>} Result with success status
   */
  const sendEmail = useCallback(
    async emailData => {
      try {
        setLoading(true);
        setError(null);
        await notificationService.sendEmail(emailData);
        showSuccess('Email sent successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to send email';
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
   * Get notification preferences
   * @returns {Promise<Object>} Result with success status and preferences data
   */
  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getPreferences();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch preferences';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Update notification preferences
   * @param {Object} preferences - Notification preferences
   * @returns {Promise<Object>} Result with success status
   */
  const updatePreferences = useCallback(
    async preferences => {
      try {
        setLoading(true);
        setError(null);
        await notificationService.updatePreferences(preferences);
        showSuccess('Preferences updated successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to update preferences';
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
   * Subscribe to push notifications
   * @param {Object} subscription - Push subscription data
   * @returns {Promise<Object>} Result with success status
   */
  const subscribeToPush = useCallback(
    async subscription => {
      try {
        setLoading(true);
        setError(null);
        await notificationService.subscribeToPush(subscription);
        showSuccess('Subscribed to push notifications');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to subscribe to push notifications';
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
   * Unsubscribe from push notifications
   * @returns {Promise<Object>} Result with success status
   */
  const unsubscribeFromPush = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await notificationService.unsubscribeFromPush();
      showSuccess('Unsubscribed from push notifications');
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to unsubscribe from push notifications';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    fetchUserReceiverNotifications,
    fetchNotificationById,
    fetchUnreadCount,
    fetchAttendeesByBookingId,
    createNotification,
    markAsRead,
    markAllAsRead,
    acceptNotification,
    rejectNotification,
    confirmLab,
    cancelLab,
    updateNotificationsToReminder,
    deleteNotification,
    deleteAllNotifications,
    sendEmail,
    fetchPreferences,
    updatePreferences,
    subscribeToPush,
    unsubscribeFromPush,
  };
};
