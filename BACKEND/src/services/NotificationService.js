const NotificationRepository = require('../repositories/NotificationRepository');
const nodemailer = require('nodemailer');
require('dotenv').config();

class NotificationService {
    constructor() {
        this.notificationRepository = new NotificationRepository();
        this.emailTransporter = this.createEmailTransporter();
    }

    createEmailTransporter() {
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async createNotification(notificationData) {
        try {
            const notification = await this.notificationRepository.create(notificationData);
            
            // Send email notification if email is enabled
            if (process.env.EMAIL_ENABLED === 'true') {
                await this.sendEmailNotification(notification);
            }
            
            return notification;
        } catch (error) {
            throw new Error(`Failed to create notification: ${error.message}`);
        }
    }

    async createBulkNotifications(attendees, notificationTemplate) {
        try {
            const notifications = [];
            
            for (const attendeeEmail of attendees) {
                const notificationData = {
                    ...notificationTemplate,
                    receiverEmail: attendeeEmail
                };
                
                const notification = await this.notificationRepository.create(notificationData);
                notifications.push(notification);
                
                // Send email notification if email is enabled
                if (process.env.EMAIL_ENABLED === 'true') {
                    await this.sendEmailNotification(notification);
                }
            }
            
            return notifications;
        } catch (error) {
            throw new Error(`Failed to create bulk notifications: ${error.message}`);
        }
    }

    async getNotificationsByReceiver(receiverEmail, excludeTypes = []) {
        try {
            const filters = excludeTypes.length > 0 ? { type: { $nin: excludeTypes } } : {};
            return await this.notificationRepository.findByReceiver(receiverEmail, filters);
        } catch (error) {
            throw new Error(`Failed to get notifications by receiver: ${error.message}`);
        }
    }

    async getNotificationsBySender(senderEmail, includeTypes = []) {
        try {
            const filters = includeTypes.length > 0 ? { type: { $in: includeTypes } } : {};
            return await this.notificationRepository.findBySender(senderEmail, filters);
        } catch (error) {
            throw new Error(`Failed to get notifications by sender: ${error.message}`);
        }
    }

    async getNotificationsByBookingId(bookingId) {
        try {
            return await this.notificationRepository.findByBookingId(bookingId);
        } catch (error) {
            throw new Error(`Failed to get notifications by booking ID: ${error.message}`);
        }
    }

    async markNotificationAsRead(notificationId, userEmail) {
        try {
            const notification = await this.notificationRepository.markAsRead(notificationId, userEmail);
            if (!notification) {
                throw new Error('Notification not found or access denied');
            }
            return notification;
        } catch (error) {
            throw new Error(`Failed to mark notification as read: ${error.message}`);
        }
    }

    async acceptNotification(notificationId, userEmail) {
        try {
            const notification = await this.notificationRepository.updateById(notificationId, {
                isReceiverConfirm: true,
                type: 'booking_confirmation',
                isRead: false
            });
            
            if (!notification || notification.receiverEmail !== userEmail) {
                throw new Error('Notification not found or access denied');
            }
            
            return notification;
        } catch (error) {
            throw new Error(`Failed to accept notification: ${error.message}`);
        }
    }

    async rejectNotification(notificationId, userEmail) {
        try {
            const notification = await this.notificationRepository.updateById(notificationId, {
                IsLabWillGoingOn: true,
                type: 'rejected',
                isRead: false,
                isReciverConfirm: false
            });
            
            if (!notification || notification.receiverEmail !== userEmail) {
                throw new Error('Notification not found or access denied');
            }
            
            return notification;
        } catch (error) {
            throw new Error(`Failed to reject notification: ${error.message}`);
        }
    }

    async confirmLab(notificationId) {
        try {
            const notification = await this.notificationRepository.findById(notificationId);
            if (!notification) {
                throw new Error('Notification not found');
            }

            const bookingId = notification.bookingId;
            if (!bookingId) {
                throw new Error('Booking ID not found in notification');
            }

            // Update all notifications with the same bookingId
            const result = await this.notificationRepository.updateByBookingId(bookingId, {
                IsLabWillGoingOn: true,
                type: 'confirmed',
                isRead: false
            });

            return { notification, updatedCount: result.modifiedCount };
        } catch (error) {
            throw new Error(`Failed to confirm lab: ${error.message}`);
        }
    }

    async cancelLab(notificationId) {
        try {
            const notification = await this.notificationRepository.findById(notificationId);
            if (!notification) {
                throw new Error('Notification not found');
            }

            const bookingId = notification.bookingId;
            if (!bookingId) {
                throw new Error('Booking ID not found in notification');
            }

            // Update all notifications with the same bookingId
            const result = await this.notificationRepository.updateByBookingId(bookingId, {
                IsLabWillGoingOn: false,
                type: 'cancellation',
                isRead: false
            });

            return { notification, updatedCount: result.modifiedCount };
        } catch (error) {
            throw new Error(`Failed to cancel lab: ${error.message}`);
        }
    }

    async updateNotificationsToReminder(date) {
        try {
            const todayISO = new Date(date).toISOString();
            const result = await this.notificationRepository.updateNotificationsByDate(todayISO, {
                type: 'reminder'
            });
            
            return { updatedCount: result.modifiedCount };
        } catch (error) {
            throw new Error(`Failed to update notifications to reminder: ${error.message}`);
        }
    }

    async sendEmailNotification(notification) {
        try {
            if (!this.emailTransporter) {
                console.warn('Email transporter not configured');
                return;
            }

            const emailContent = this.generateEmailContent(notification);
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: notification.receiverEmail,
                subject: emailContent.subject,
                html: emailContent.html
            };

            const result = await this.emailTransporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return result;
        } catch (error) {
            console.error('Failed to send email:', error.message);
            // Don't throw error to prevent notification creation failure
        }
    }

    generateEmailContent(notification) {
        const baseSubject = `Lab Booking ${notification.type.replace('_', ' ').toUpperCase()}`;
        
        const emailTemplates = {
            request: {
                subject: `${baseSubject} - ${notification.labSessionTitle}`,
                html: `
                    <h2>Lab Booking Request</h2>
                    <p>You have received a lab booking request:</p>
                    <ul>
                        <li><strong>Lab Session:</strong> ${notification.labSessionTitle}</li>
                        <li><strong>Date:</strong> ${notification.labDate}</li>
                        <li><strong>Time:</strong> ${notification.labStartTime} - ${notification.labEndTime}</li>
                        <li><strong>From:</strong> ${notification.senderEmail}</li>
                    </ul>
                    <p><strong>Message:</strong> ${notification.message}</p>
                    <p>Please log in to the system to respond to this request.</p>
                `
            },
            booking_confirmation: {
                subject: `${baseSubject} - ${notification.labSessionTitle}`,
                html: `
                    <h2>Lab Booking Confirmed</h2>
                    <p>Your lab booking has been confirmed:</p>
                    <ul>
                        <li><strong>Lab Session:</strong> ${notification.labSessionTitle}</li>
                        <li><strong>Date:</strong> ${notification.labDate}</li>
                        <li><strong>Time:</strong> ${notification.labStartTime} - ${notification.labEndTime}</li>
                    </ul>
                    <p>Thank you for confirming your attendance.</p>
                `
            },
            confirmed: {
                subject: `${baseSubject} - ${notification.labSessionTitle}`,
                html: `
                    <h2>Lab Session Confirmed</h2>
                    <p>The lab session has been officially confirmed:</p>
                    <ul>
                        <li><strong>Lab Session:</strong> ${notification.labSessionTitle}</li>
                        <li><strong>Date:</strong> ${notification.labDate}</li>
                        <li><strong>Time:</strong> ${notification.labStartTime} - ${notification.labEndTime}</li>
                    </ul>
                    <p>Please make sure to attend the session.</p>
                `
            },
            rejected: {
                subject: `${baseSubject} - ${notification.labSessionTitle}`,
                html: `
                    <h2>Lab Booking Rejected</h2>
                    <p>A lab booking request has been rejected:</p>
                    <ul>
                        <li><strong>Lab Session:</strong> ${notification.labSessionTitle}</li>
                        <li><strong>Date:</strong> ${notification.labDate}</li>
                        <li><strong>Time:</strong> ${notification.labStartTime} - ${notification.labEndTime}</li>
                    </ul>
                    <p>Please contact the organizer for more information.</p>
                `
            },
            cancellation: {
                subject: `${baseSubject} - ${notification.labSessionTitle}`,
                html: `
                    <h2>Lab Session Cancelled</h2>
                    <p>The following lab session has been cancelled:</p>
                    <ul>
                        <li><strong>Lab Session:</strong> ${notification.labSessionTitle}</li>
                        <li><strong>Date:</strong> ${notification.labDate}</li>
                        <li><strong>Time:</strong> ${notification.labStartTime} - ${notification.labEndTime}</li>
                    </ul>
                    <p>We apologize for any inconvenience.</p>
                `
            },
            reminder: {
                subject: `${baseSubject} - ${notification.labSessionTitle} Tomorrow`,
                html: `
                    <h2>Lab Session Reminder</h2>
                    <p>This is a reminder for your upcoming lab session:</p>
                    <ul>
                        <li><strong>Lab Session:</strong> ${notification.labSessionTitle}</li>
                        <li><strong>Date:</strong> ${notification.labDate}</li>
                        <li><strong>Time:</strong> ${notification.labStartTime} - ${notification.labEndTime}</li>
                    </ul>
                    <p>Don't forget to attend your lab session tomorrow!</p>
                `
            }
        };

        return emailTemplates[notification.type] || {
            subject: `Lab Notification - ${notification.labSessionTitle}`,
            html: `
                <h2>Lab Notification</h2>
                <p>You have a new notification regarding:</p>
                <ul>
                    <li><strong>Lab Session:</strong> ${notification.labSessionTitle}</li>
                    <li><strong>Date:</strong> ${notification.labDate}</li>
                    <li><strong>Time:</strong> ${notification.labStartTime} - ${notification.labEndTime}</li>
                </ul>
                <p><strong>Message:</strong> ${notification.message}</p>
            `
        };
    }
}

module.exports = NotificationService;