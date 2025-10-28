const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/BookingController');
const { auth } = require('../middleware/auth');

const bookingController = new BookingController();

// Middleware to check booking permissions
function checkRole(req, res, next) {
  bookingController.checkBookingPermission(req, res, next);
}
// Check availability
router.post('/check-availability', auth, checkRole, (req, res) => {
  bookingController.checkAvailability(req, res);
});

// Create a new booking
router.post('/', auth, checkRole, (req, res) => {
  bookingController.createBooking(req, res);
});

// Get all bookings
router.get('/', auth, (req, res) => {
  bookingController.getAllBookings(req, res);
});

// Get booking by ID
router.get('/:id', auth, (req, res) => {
  bookingController.getBookingById(req, res);
});

// Get bookings by status
router.get('/status/:status', auth, (req, res) => {
  bookingController.getBookingsByStatus(req, res);
});

// Get bookings by date range
router.get('/date-range', auth, (req, res) => {
  bookingController.getBookingsByDateRange(req, res);
});

// Get booking statistics
router.get('/stats/overview', auth, (req, res) => {
  bookingController.getBookingStats(req, res);
});

// Get upcoming bookings
router.get('/upcoming/list', auth, (req, res) => {
  bookingController.getUpcomingBookings(req, res);
});

// Update booking
router.put('/:id', auth, checkRole, (req, res) => {
  bookingController.updateBooking(req, res);
});

// Cancel booking
router.patch('/:id/cancel', auth, checkRole, (req, res) => {
  bookingController.cancelBooking(req, res);
});

// Confirm booking
router.patch('/:id/confirm', auth, checkRole, (req, res) => {
  bookingController.confirmBooking(req, res);
});

// Delete booking permanently (admin only)
router.delete('/:id', auth, (req, res) => {
  bookingController.deleteBooking(req, res);
});

// Legacy routes for compatibility with existing frontend
router.post('/cancelLabSession/:bookingId', auth, checkRole, (req, res) => {
  bookingController.cancelLabSession(req, res);
});

router.put('/editLabSession/:bookingId', auth, checkRole, (req, res) => {
  bookingController.editLabSession(req, res);
});

module.exports = router;
