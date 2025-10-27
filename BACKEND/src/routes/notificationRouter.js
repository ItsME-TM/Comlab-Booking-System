const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); 
const crypto = require('crypto');
const User = require('../models/user');
const Booking = require('../models/labBooking');
require('dotenv').config();


// POST route to create notifications
router.post('/createNotification', auth, async (req, res) => {
    try {
        if ( req.user.role !== 'lecturer' && req.user.role !== 'instructor') {
            return res.status(403).json({ error: "Access denied." });
          }
          const { title, startTime, endTime, description, attendees, uEmail, uDate, bookingId} = req.body;

        // Function to create notifications for each attendee
        const createNotifications = async (attendees) => {
            const notifications = [];

            for (let i = 0; i < attendees.length; i++) {
                const receiverEmail = attendees[i];
                console.log('receiverEmail:', receiverEmail);
                const senderEmail = uEmail

                const newNotification = new Notification({
                    receiverEmail,
                    bookingId:bookingId,
                    senderEmail,
                    labSessionTitle: title,
                    labDate: uDate,
                    labStartTime: startTime,
                    labEndTime: endTime,
                    message: description,
                    isReceiverConfirm: false,
                    IsLabWillGoingOn: true,
                    isRead: false,
                    type: 'request',
                    
                });
                await newNotification.save();
                notifications.push(newNotification);
            }

            return notifications;
        };

        // Create notifications for each attendee
        const notifications = await createNotifications(attendees);

        res.status(201).json(notifications);
    } catch (error) {
        console.error('Error creating notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//fetch all notifications type is not equal to booking_confirmation
router.get('/', auth, async (req, res) => {
    const requestUser = await User.findById(req.user._id);
    const userEmail = requestUser.email; 

    try {
        if (req.user.role !== 'to' && req.user.role !== 'lecturer' && req.user.role !== 'instructor') {
            return res.status(403).json({ error: "Access denied." });
        }

        const notifications = await Notification.find({
            receiverEmail: userEmail,
            type: { $ne: 'booking_confirmation' }
        });

        console.log('notifications:', notifications);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//fetch user, who booked lab and type is equal to booking_confirmation
router.get('/userReciver/', auth, async (req, res) => {
    try {
        const requestUser = await User.findById(req.user._id);
        const userEmail = requestUser.email;
        if (req.user.role !== 'to' && req.user.role !== 'lecturer' && req.user.role !== 'instructor') {
            return res.status(403).json({ error: "Access denied." });
        }

        const notifications = await Notification.find({
            senderEmail: userEmail,
            $or: [
                { type: 'booking_confirmation' },
                { type: 'rejected' }
            ]
        });

        if (!notifications) {
            return res.status(404).json({ message: 'Notification not found for the current user' });
        }

        console.log('notifications:', notifications);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//mark read 
router.put('/markRead/:id', auth, async (req, res) => {
    const { id } = req.params;
    const requestUser = await User.findById(req.user._id);
    const userEmail = requestUser.email;


    try {
        if (req.user.role !== 'to' && req.user.role !== 'lecturer' && req.user.role !== 'instructor') {
            return res.status(403).json({ error: "Access denied." });
          }
          const notification = await Notification.findOneAndUpdate(
            { 
                _id: id, 
                $or: [
                    { receiverEmail: userEmail },
                    { senderEmail: userEmail }
                ] 
            },

            { isRead: true },
            { new: true } // Return updated document
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found for the current user' });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// accepct
router.post('/updateIsReceiverConfirm/:notificationId', auth, async (req, res) => {
    const { notificationId } = req.params;
    const userEmail = req.user.email;

    try {
        // Find and update the notification
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, receiverEmail: userEmail },
            { isReceiverConfirm: true, type: 'booking_confirmation', isRead:false  },
            { new: true } // Return updated document
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found for the current user' });
        }

        res.status(200).json({
            message: 'isReceiverConfirm and booking status updated successfully',
            notification
        });
    } catch (error) {
        console.error('Error updating isReceiverConfirm and booking status:', error);
        res.status(500).json({ message: 'Server error' });
    }

});

//reject
router.post('/reject/:notificationId', auth, async (req, res) => {
    const { notificationId } = req.params;
    const userEmail = req.user.email; 

    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, receiverEmail: userEmail },
            { IsLabWillGoingOn: true, 
              type: 'rejected',
              isRead:false,
              isReciverConfirm:false
            },
            { new: true } // Return updated document
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found for the current user' });
        }
        res.status(200).json({ message: 'IsLabWillGoingOn updated to false and type changed to cancellation', notification });
    } catch (error) {
        console.error('Error updating IsLabWillGoingOn and type:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


//confirmed lab
router.post('/confirmedLab/:notificationId', auth, async (req, res) => {
    const { notificationId } = req.params;

    try {
        if (req.user.role !== 'lecturer' && req.user.role !== 'instructor' && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. You're not authorized to book labs." });
        }

        // Find the notification
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        const bookingId = notification.bookingId;
        if (!bookingId) {
            return res.status(400).json({ message: 'Booking ID not found in the notification' });
        }

        // Update all notifications with the same bookingId
        const updatedNotifications = await Notification.updateMany(
            { bookingId: bookingId },
            { IsLabWillGoingOn: true, type: 'confirmed', isRead:false  }
        );

        // Find and update the booking
        const booking = await Booking.findOneAndUpdate(
            { _id: bookingId },
            { status: 'confirmed'},
            { new: true } // Return updated document
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({
            message: 'booking status updated successfully',
            updatedNotifications,
            booking
        });
    } catch (error) {
        console.error('Error updating isReceiverConfirm and booking status:', error);
        res.status(500).json({ message: 'Server error' });
    }

});


// lab cancel
router.post('/updateIsLabStatus/:notificationId', auth, async (req, res) => {
    const { notificationId } = req.params;

    try {
        // Check user role
        if (req.user.role !== 'lecturer' && req.user.role !== 'instructor' && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied. You're not authorized to book labs." });
        }

        // Find the notification
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        const bookingId = notification.bookingId;
        if (!bookingId) {
            return res.status(400).json({ message: 'Booking ID not found in the notification' });
        }

        // Update all notifications with the same bookingId
        const updatedNotifications = await Notification.updateMany(
            { bookingId: bookingId },
            {
                IsLabWillGoingOn: false,
                type: 'cancellation',
                isRead: false
            }
        );

        // Update the booking
        const booking = await Booking.findOneAndUpdate(
            { _id: bookingId },
            { status: 'cancelled' },
            { new: true } // Return updated document
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'IsLabWillGoingOn updated to false and type changed to cancellation', updatedNotifications });
    } catch (error) {
        console.error('Error updating IsLabWillGoingOn and type:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// POST route to update type based on labDate proximity for notifications for the authenticated user
router.post('/updateNotificationType/:notificationId', auth, async (req, res) => {
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        const labDate = moment(notification.labDate);
        const currentDate = moment();

        // Calculate difference in days
        const daysDifference = labDate.diff(currentDate, 'days');

        // Update type to 'reminder' if labDate is 1 day away
        if (daysDifference === 1) {
            notification.type = 'reminder';
            await notification.save();
            return res.status(200).json({ message: 'Notification type updated to reminder', notification });
        } else {
            return res.status(200).json({ message: 'Notification type remains unchanged', notification });
        }
    } catch (error) {
        console.error('Error updating notification type:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//fetch attendees and their types by bookingId
router.get('/attendeesAndTypeByBookingId/:bookingId', auth, async (req, res) => {
    try {
        const { bookingId } = req.params;

        // Find notifications by bookingId
        const notifications = await Notification.find({ bookingId });

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
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/reminder', async (req, res) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); 

    const todayISO = today.toISOString(); 

    try {
        const result = await Notification.updateMany(
            { labDate: todayISO, type: { $ne: 'cancellation' } },
            { $set: { type: 'reminder' } }
        );

        res.status(200).json({
            message: 'Notifications updated to reminders',
            updatedCount: result.nModified
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;