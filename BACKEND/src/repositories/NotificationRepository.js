const Notification = require('../models/notification');

/**
 * Repository class for notification data access
 * Handles all database operations for notifications
 */
class NotificationRepository {
  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification document
   */
  async create(notificationData) {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  /**
   * Find a notification by ID
   * @param {string} id - Notification ID
   * @returns {Promise<Object|null>} Notification document or null
   */
  async findById(id) {
    return await Notification.findById(id);
  }

  /**
   * Find notifications by receiver email
   * @param {string} receiverEmail - Receiver's email address
   * @param {Object} [filters={}] - Additional MongoDB query filters
   * @returns {Promise<Array<Object>>} Array of notification documents
   */
  async findByReceiver(receiverEmail, filters = {}) {
    const query = { receiverEmail, ...filters };
    return await Notification.find(query).sort({ createdAt: -1 });
  }

  /**
   * Find notifications by sender email
   * @param {string} senderEmail - Sender's email address
   * @param {Object} [filters={}] - Additional MongoDB query filters
   * @returns {Promise<Array<Object>>} Array of notification documents
   */
  async findBySender(senderEmail, filters = {}) {
    const query = { senderEmail, ...filters };
    return await Notification.find(query).sort({ createdAt: -1 });
  }

  /**
   * Find notifications by booking ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Array<Object>>} Array of notification documents
   */
  async findByBookingId(bookingId) {
    return await Notification.find({ bookingId }).sort({ createdAt: -1 });
  }

  /**
   * Update a notification by ID
   * @param {string} id - Notification ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated notification document or null
   */
  async updateById(id, updateData) {
    return await Notification.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Update all notifications for a booking
   * @param {string} bookingId - Booking ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result with modified count
   */
  async updateByBookingId(bookingId, updateData) {
    return await Notification.updateMany({ bookingId }, updateData);
  }

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   * @param {string} userEmail - User's email address
   * @returns {Promise<Object|null>} Updated notification document or null
   */
  async markAsRead(id, userEmail) {
    return await Notification.findOneAndUpdate(
      {
        _id: id,
        $or: [{ receiverEmail: userEmail }, { senderEmail: userEmail }],
      },
      { isRead: true },
      { new: true },
    );
  }

  /**
   * Update notifications by date
   * @param {string} date - Date in ISO format
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result with modified count
   */
  async updateNotificationsByDate(date, updateData) {
    return await Notification.updateMany(
      { labDate: date, type: { $ne: 'cancellation' } },
      updateData,
    );
  }

  /**
   * Delete a notification by ID
   * @param {string} id - Notification ID
   * @returns {Promise<Object|null>} Deleted notification document or null
   */
  async deleteById(id) {
    return await Notification.findByIdAndDelete(id);
  }

  /**
   * Find all notifications matching filters
   * @param {Object} [filters={}] - MongoDB query filters
   * @returns {Promise<Array<Object>>} Array of notification documents
   */
  async findAll(filters = {}) {
    return await Notification.find(filters).sort({ createdAt: -1 });
  }
}

module.exports = NotificationRepository;
