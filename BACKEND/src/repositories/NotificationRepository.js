const Notification = require('../models/notification');

class NotificationRepository {
  async create(notificationData) {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  async findById(id) {
    return await Notification.findById(id);
  }

  async findByReceiver(receiverEmail, filters = {}) {
    const query = { receiverEmail, ...filters };
    return await Notification.find(query).sort({ createdAt: -1 });
  }

  async findBySender(senderEmail, filters = {}) {
    const query = { senderEmail, ...filters };
    return await Notification.find(query).sort({ createdAt: -1 });
  }

  async findByBookingId(bookingId) {
    return await Notification.find({ bookingId }).sort({ createdAt: -1 });
  }

  async updateById(id, updateData) {
    return await Notification.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateByBookingId(bookingId, updateData) {
    return await Notification.updateMany({ bookingId }, updateData);
  }

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

  async updateNotificationsByDate(date, updateData) {
    return await Notification.updateMany(
      { labDate: date, type: { $ne: 'cancellation' } },
      updateData,
    );
  }

  async deleteById(id) {
    return await Notification.findByIdAndDelete(id);
  }

  async findAll(filters = {}) {
    return await Notification.find(filters).sort({ createdAt: -1 });
  }
}

module.exports = NotificationRepository;
