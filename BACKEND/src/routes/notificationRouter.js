const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const auth = require('../middleware/auth');

const notificationController = new NotificationController();


// POST route to create notifications
router.post('/createNotification', auth, (req, res) => {
    notificationController.createNotification(req, res);
});

//fetch all notifications type is not equal to booking_confirmation
router.get('/', auth, (req, res) => {
    notificationController.getNotifications(req, res);
});

//fetch user, who booked lab and type is equal to booking_confirmation
router.get('/userReciver/', auth, (req, res) => {
    notificationController.getUserReceiverNotifications(req, res);
});

//mark read 
router.put('/markRead/:id', auth, (req, res) => {
    notificationController.markAsRead(req, res);
});


// accept
router.post('/updateIsReceiverConfirm/:notificationId', auth, (req, res) => {
    notificationController.acceptNotification(req, res);
});

//reject
router.post('/reject/:notificationId', auth, (req, res) => {
    notificationController.rejectNotification(req, res);
});


//confirmed lab
router.post('/confirmedLab/:notificationId', auth, (req, res) => {
    notificationController.confirmLab(req, res);
});


// lab cancel
router.post('/updateIsLabStatus/:notificationId', auth, (req, res) => {
    notificationController.cancelLab(req, res);
});


// This route is deprecated - use PUT /reminder instead

//fetch attendees and their types by bookingId
router.get('/attendeesAndTypeByBookingId/:bookingId', auth, (req, res) => {
    notificationController.getAttendeesByBookingId(req, res);
});
router.put('/reminder', (req, res) => {
    notificationController.updateNotificationsToReminder(req, res);
});


module.exports = router;