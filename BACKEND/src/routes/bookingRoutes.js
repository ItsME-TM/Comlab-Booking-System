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
/*
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
*/
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

    const canceledBookings = overlappingBookings.filter(booking => booking.status === 'cancelled');
    const activeBookings = overlappingBookings.filter(booking => booking.status !== 'cancelled');

    if (activeBookings.length > 0) {
      const activeDetails = activeBookings.map(booking => ({
        title: booking.title,
        status: booking.status,
        startTime: booking.startTime,
        endTime: booking.endTime
      }));
      return res.status(400).json({ error: 'Time slot is already booked', activeDetails });
    }

    if (canceledBookings.length > 0) {
      const canceledDetails = canceledBookings.map(booking => ({
        title: booking.title,
        description: booking.description,
        status: booking.status,
        startTime: booking.startTime,
        endTime: booking.endTime
      }));
      return res.status(200).json({ message: 'Some overlapping bookings are cancelled', canceledDetails });
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
        { startTime: { $lt: endTime, $gte: startTime }, status: { $ne: 'cancelled' } },
        { endTime: { $gt: startTime, $lte: endTime }, status: { $ne: 'cancelled' } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime }, status: { $ne: 'cancelled' } }
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
    const bookings = await Booking.find({ status: { $ne: 'cancelled' } });
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

router.post('/cancelLabSession/:bookingId', auth, async (req, res) => {
  const { bookingId } = req.params;
  
  try {
    // Check user role
    if (req.user.role !== 'lecturer' && req.user.role !== 'instructor' && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. You're not authorized to book labs." });
    }

    // Find and update the booking
    const booking = await Booking.findOneAndUpdate(
        { _id: bookingId },
        { status: 'cancelled' },
        { new: true } // Return updated document
      );

    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
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

    res.status(200).json({
      message: ' cancel lab session successfully',
      updatedNotifications,
      booking
  });
  } catch (error) {
    console.error('Error cancel lab session:', error);
    res.status(500).json({ message: 'Server error' });
}
});

// Edit lab session
router.put('/editLabSession/:bookingId', auth, async (req, res) => {
  const { bookingId } = req.params;

  try {
    const { title, startTime, endTime, description, attendees } = req.body;

    // Update the lab session in the Booking collection
    const updatelab = await Booking.findOneAndUpdate(
      { _id: bookingId },
      {
        title: title,
        startTime: startTime,
        endTime: endTime,
        description: description,
        attendees: attendees
      },
      { new: true }
    );

    if (!updatelab) return res.status(404).json({ error: 'Lab session not found' });

    // Fetch existing notifications for the bookingId
    const notifications = await Notification.find({ bookingId: bookingId });
    const existingAttendees = notifications.map(notification => notification.receiverEmail);

    // Extract date from startTime
    const labStartTime = new Date(startTime);
    const formattedDate = new Date(Date.UTC(labStartTime.getUTCFullYear(), labStartTime.getUTCMonth(), labStartTime.getUTCDate(), 0, 0, 0, 0)).toISOString();

    // Update or delete notifications
    for (let i = 0; i < existingAttendees.length; i++) {
      if (i < attendees.length && attendees[i]) {
        // Update existing notification
        await Notification.findOneAndUpdate(
          { bookingId: bookingId, receiverEmail: existingAttendees[i] },
          {
            receiverEmail: attendees[i],
            labSessionTitle: title,
            labStartTime: startTime,
            labEndTime: endTime,
            message: description,
            isRead: false,
            labDate: formattedDate // Add the formatted date here
          },
          { new: true }
        );
      } else {
        // Delete notification if attendee is empty or no corresponding new attendee
        await Notification.findOneAndDelete({
          bookingId: bookingId,
          receiverEmail: existingAttendees[i]
        });
      }
    }

    res.json({ message: 'Lab updated successfully', updatedLab: updatelab });
  } catch (error) {
    console.error('Error updating lab session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
