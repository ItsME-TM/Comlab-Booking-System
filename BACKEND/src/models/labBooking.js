const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  attendees: [{ type: String, ref: 'User' }],
});

module.exports = mongoose.model('Booking', bookingSchema);
