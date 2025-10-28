import apiClient from './apiClient';

/**
 * Notification service for handling notification operations
 */
class NotificationService {
  /**
   * Get all notifications for current user
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} List of notifications
   */
  async getNotifications(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams
        ? `/notifications?${queryParams}`
        : '/notifications';
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  }

  /**
   * Get notification by ID
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Notification data
   */
  async getNotificationById(notificationId) {
    try {
      const response = await apiClient.get(`/notifications/${notificationId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch notification');
    }
  }

  /**
   * Create new notification
   * @param {Object} notificationData - Notification data
   * @param {string} notificationData.userId - Target user ID
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.message - Notification message
   * @param {string} notificationData.type - Notification type
   * @returns {Promise<Object>} Created notification data
   */
  async createNotification(notificationData) {
    try {
      const response = await apiClient.post('/notifications', notificationData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create notification');
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Update response
   */
  async markAsRead(notificationId) {
    try {
      const response = await apiClient.patch(
        `/notifications/${notificationId}/read`,
      );
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Update response
   */
  async markAllAsRead() {
    try {
      const response = await apiClient.patch('/notifications/mark-all-read');
      return response;
    } catch (error) {
      throw new Error(
        error.message || 'Failed to mark all notifications as read',
      );
    }
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Deletion response
   */
  async deleteNotification(notificationId) {
    try {
      const response = await apiClient.delete(
        `/notifications/${notificationId}`,
      );
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete notification');
    }
  }

  /**
   * Delete all notifications
   * @returns {Promise<Object>} Deletion response
   */
  async deleteAllNotifications() {
    try {
      const response = await apiClient.delete('/notifications');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete all notifications');
    }
  }

  /**
   * Get unread notification count
   * @returns {Promise<Object>} Unread count response
   */
  async getUnreadCount() {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch unread count');
    }
  }

  /**
   * Send email notification
   * @param {Object} emailData - Email notification data
   * @param {string} emailData.recipient - Recipient email
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.template - Email template
   * @param {Object} emailData.data - Template data
   * @returns {Promise<Object>} Send response
   */
  async sendEmail(emailData) {
    try {
      const response = await apiClient.post(
        '/notifications/send-email',
        emailData,
      );
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to send email notification');
    }
  }

  /**
   * Get notification preferences
   * @returns {Promise<Object>} Notification preferences
   */
  async getPreferences() {
    try {
      const response = await apiClient.get('/notifications/preferences');
      return response;
    } catch (error) {
      throw new Error(
        error.message || 'Failed to fetch notification preferences',
      );
    }
  }

  /**
   * Update notification preferences
   * @param {Object} preferences - Notification preferences
   * @returns {Promise<Object>} Update response
   */
  async updatePreferences(preferences) {
    try {
      const response = await apiClient.put(
        '/notifications/preferences',
        preferences,
      );
      return response;
    } catch (error) {
      throw new Error(
        error.message || 'Failed to update notification preferences',
      );
    }
  }

  /**
   * Subscribe to push notifications
   * @param {Object} subscription - Push subscription data
   * @returns {Promise<Object>} Subscription response
   */
  async subscribeToPush(subscription) {
    try {
      const response = await apiClient.post(
        '/notifications/push-subscribe',
        subscription,
      );
      return response;
    } catch (error) {
      throw new Error(
        error.message || 'Failed to subscribe to push notifications',
      );
    }
  }

  /**
   * Unsubscribe from push notifications
   * @returns {Promise<Object>} Unsubscription response
   */
  async unsubscribeFromPush() {
    try {
      const response = await apiClient.post('/notifications/push-unsubscribe');
      return response;
    } catch (error) {
      throw new Error(
        error.message || 'Failed to unsubscribe from push notifications',
      );
    }
  }
}

// Export singleton instance
export default new NotificationService();
