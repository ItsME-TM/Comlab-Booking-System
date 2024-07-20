const express = require('express');
const router = express.Router();
const Booking = require('../models/labBooking');
const auth = require('../middleware/auth');
const Notification = require('../models/notification');

function checkRole(req, res, next) {
  console.log('hit checkRole', req.user.role);
  if (req.user.role !== 'lecturer' && req.user.role !== 'instructor') {
    return res.status(403).json({ error: "Access denied. You're not authorized to book labs." });
  }
  next();
}

router.post('/check-availability', auth, checkRole, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const overlappingBookings = await Booking.find({
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    res.json({ message: 'Time slot is available' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new booking
router.post('/', auth, checkRole, async (req, res) => {
  try {
    const { title, startTime, endTime, description, attendees } = req.body;

    const overlappingBookings = await Booking.find({
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    const newBooking = new Booking({ title, startTime, endTime, description, attendees });
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all bookings
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a booking by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/cancelLabSession/:labId', auth, checkRole, async (req, res) => {
  const { labId } = req.params;
  console.log ('y8gbtgbs68y7hy7uasr7ybat76', labId);

  try {

    // Find and update the booking
    const booking = await Booking.findOneAndUpdate(
        { _id: labId },
        { status: 'cancelled' },
        { new: true } // Return updated document
      );

    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }

      // Find and update the notification
      const notification = await Notification.findOneAndUpdate(
        { bookingId: labId},
        { 
          IsLabWillGoingOn: false, 
          type: 'cancellation',
          isRead:false
        },
        { new: true } // Return updated document
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      message: ' cancel lab session successfully',
      notification,
      booking
  });
  } catch (error) {
    console.error('Error cancel lab session:', error);
    res.status(500).json({ message: 'Server error' });
}
});

module.exports = router;
