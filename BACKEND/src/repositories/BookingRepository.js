const Booking = require('../models/labBooking');

class BookingRepository {
  async create(bookingData) {
    const booking = new Booking(bookingData);
    return await booking.save();
  }

  async findById(id) {
    return await Booking.findById(id);
  }

  async findAll(filters = {}) {
    return await Booking.find(filters);
  }

  async findActiveBookings() {
    return await Booking.find({ status: { $ne: 'cancelled' } });
  }

  async findOverlappingBookings(startTime, endTime, excludeStatuses = ['cancelled']) {
    return await Booking.find({
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ],
      status: { $nin: excludeStatuses }
    });
  }

  async findByDateRange(startDate, endDate) {
    return await Booking.find({
      startTime: { $gte: startDate },
      endTime: { $lte: endDate }
    });
  }

  async findByStatus(status) {
    return await Booking.find({ status });
  }

  async update(id, updateData) {
    return await Booking.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateStatus(id, status) {
    return await Booking.findByIdAndUpdate(id, { status }, { new: true });
  }

  async delete(id) {
    return await Booking.findByIdAndDelete(id);
  }

  async count(filters = {}) {
    return await Booking.countDocuments(filters);
  }

  async exists(id) {
    const booking = await Booking.findById(id);
    return !!booking;
  }
}

module.exports = BookingRepository;