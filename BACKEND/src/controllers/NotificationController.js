const NotificationService = require('../services/NotificationService');
const User = require('../models/user');

class NotificationController {
    constructor() {
        this.notificationService = new NotificationService();
    }

    async createNotification(req, res) {
        try {
            // Check user permissions
            if (req.user.role !== 'lecturer' && req.user.role !== 'instructor') {
                return res.status(403).json({ error: "Access denied." });
            }

            const { title, startTime, endTime, description, attendees, uEmail, uDate, bookingId } = req.body;

            // Validate required fields
            if (!title || !startTime || !endTime || !description || !attendees || !uEmail || !uDate || !bookingId) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const notificationTemplate = {
                bookingId,
                senderEmail: uEmail,
                labSessionTitle: title,
                labDate: uDate,
                labStartTime: startTime,
                labEndTime: endTime,
                message: description,
                isReceiverConfirm: false,
                IsLabWillGoingOn: true,
                isRead: false,
                type: 'request'
            };

            const notifications = await this.notificationService.createBulkNotifications(attendees, notificationTemplate);
            
            res.status(201).json(notifications);
        } catch (error) {
            console.error('Error creating notifications:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getNotifications(req, res) {
        try {
            // Check user permissions
            if (req.user.role !== 'to' && req.user.role !== 'lecturer' && req.user.role !== 'instructor') {
                return res.status(403).json({ error: "Access denied." });
            }

            const requestUser = await User.findById(req.user._id);
            const userEmail = requestUser.email;

            const notifications = await this.notificationService.getNotificationsByReceiver(
                userEmail, 
                ['booking_confirmation']
            );

            res.status(200).json(notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getUserReceiverNotifications(req, res) {
        try {
            // Check user permissions
            if (req.user.role !== 'to' && req.user.role !== 'lecturer' && req.user.role !== 'instructor') {
                return res.status(403).json({ error: "Access denied." });
            }

            const requestUser = await User.findById(req.user._id);
            const userEmail = requestUser.email;

            const notifications = await this.notificationService.getNotificationsBySender(
                userEmail,
                ['booking_confirmation', 'rejected']
            );

            res.status(200).json(notifications);
        } catch (error) {
            console.error('Error fetching user receiver notifications:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async markAsRead(req, res) {
        try {
            // Check user permissions
            if (req.user.role !== 'to' && req.user.role !== 'lecturer' && req.user.role !== 'instructor') {
                return res.status(403).json({ error: "Access denied." });
            }

            const { id } = req.params;
            const requestUser = await User.findById(req.user._id);
            const userEmail = requestUser.email;

            const notification = await this.notificationService.markNotificationAsRead(id, userEmail);
            
            res.status(200).json(notification);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async acceptNotification(req, res) {
        try {
            const { notificationId } = req.params;
            const userEmail = req.user.email;

            const notification = await this.notificationService.acceptNotification(notificationId, userEmail);
            
            res.status(200).json({
                message: 'Notification accepted successfully',
                notification
            });
        } catch (error) {
            console.error('Error accepting notification:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async rejectNotification(req, res) {
        try {
            const { notificationId } = req.params;
            const userEmail = req.user.email;

            const notification = await this.notificationService.rejectNotification(notificationId, userEmail);
            
            res.status(200).json({
                message: 'Notification rejected successfully',
                notification
            });
        } catch (error) {
            console.error('Error rejecting notification:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async confirmLab(req, res) {
        try {
            // Check user permissions
            if (req.user.role !== 'lecturer' && req.user.role !== 'instructor' && req.user.role !== 'admin') {
                return res.status(403).json({ error: "Access denied. You're not authorized to confirm labs." });
            }

            const { notificationId } = req.params;
            const result = await this.notificationService.confirmLab(notificationId);
            
            res.status(200).json({
                message: 'Lab confirmed successfully',
                updatedNotifications: result.updatedCount,
                notification: result.notification
            });
        } catch (error) {
            console.error('Error confirming lab:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async cancelLab(req, res) {
        try {
            // Check user permissions
            if (req.user.role !== 'lecturer' && req.user.role !== 'instructor' && req.user.role !== 'admin') {
                return res.status(403).json({ error: "Access denied. You're not authorized to cancel labs." });
            }

            const { notificationId } = req.params;
            const result = await this.notificationService.cancelLab(notificationId);
            
            res.status(200).json({
                message: 'Lab cancelled successfully',
                updatedNotifications: result.updatedCount
            });
        } catch (error) {
            console.error('Error cancelling lab:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async getAttendeesByBookingId(req, res) {
        try {
            const { bookingId } = req.params;

            const notifications = await this.notificationService.getNotificationsByBookingId(bookingId);

            if (!notifications || notifications.length === 0) {
                return res.status(404).json({ error: "No notifications found for the provided bookingId." });
            }

            // Map notifications to the desired format
            const attendeesType = notifications.map(notification => ({
                [notification.receiverEmail]: notification.type
            }));

            res.status(200).json(attendeesType);
        } catch (error) {
            console.error('Error fetching attendees by bookingId:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }

    async updateNotificationsToReminder(req, res) {
        try {
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            const result = await this.notificationService.updateNotificationsToReminder(today);
            
            res.status(200).json({
                message: 'Notifications updated to reminders',
                updatedCount: result.updatedCount
            });
        } catch (error) {
            console.error('Error updating notifications to reminder:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
}

module.exports = NotificationController;