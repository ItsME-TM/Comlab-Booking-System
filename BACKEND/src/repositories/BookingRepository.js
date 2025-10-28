const Booking = require('../models/labBooking');

/**
 * Repository class for booking data access
 * Handles all database operations for bookings
 */
class BookingRepository {
  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise<Object>} Created booking document
   */
  async create(bookingData) {
    const booking = new Booking(bookingData);
    return await booking.save();
  }

  /**
   * Find a booking by ID
   * @param {string} id - Booking ID
   * @returns {Promise<Object|null>} Booking document or null
   */
  async findById(id) {
    return await Booking.findById(id);
  }

  /**
   * Find all bookings matching filters
   * @param {Object} [filters={}] - MongoDB query filters
   * @returns {Promise<Array<Object>>} Array of booking documents
   */
  async findAll(filters = {}) {
    return await Booking.find(filters);
  }

  /**
   * Find all active (non-cancelled) bookings
   * @returns {Promise<Array<Object>>} Array of active booking documents
   */
  async findActiveBookings() {
    return await Booking.find({ status: { $ne: 'cancelled' } });
  }

  /**
   * Find bookings that overlap with a given time range
   * @param {Date} startTime - Start time to check
   * @param {Date} endTime - End time to check
   * @param {Array<string>} [excludeStatuses=['cancelled']] - Statuses to exclude
   * @returns {Promise<Array<Object>>} Array of overlapping booking documents
   */
  async findOverlappingBookings(
    startTime,
    endTime,
    excludeStatuses = ['cancelled'],
  ) {
    return await Booking.find({
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
      ],
      status: { $nin: excludeStatuses },
    });
  }

  /**
   * Find bookings within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array<Object>>} Array of booking documents
   */
  async findByDateRange(startDate, endDate) {
    return await Booking.find({
      startTime: { $gte: startDate },
      endTime: { $lte: endDate },
    });
  }

  /**
   * Find bookings by status
   * @param {string} status - Booking status
   * @returns {Promise<Array<Object>>} Array of booking documents
   */
  async findByStatus(status) {
    return await Booking.find({ status });
  }

  /**
   * Update a booking
   * @param {string} id - Booking ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated booking document or null
   */
  async update(id, updateData) {
    return await Booking.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Update booking status
   * @param {string} id - Booking ID
   * @param {string} status - New status
   * @returns {Promise<Object|null>} Updated booking document or null
   */
  async updateStatus(id, status) {
    return await Booking.findByIdAndUpdate(id, { status }, { new: true });
  }

  /**
   * Delete a booking
   * @param {string} id - Booking ID
   * @returns {Promise<Object|null>} Deleted booking document or null
   */
  async delete(id) {
    return await Booking.findByIdAndDelete(id);
  }

  /**
   * Count bookings matching filters
   * @param {Object} [filters={}] - MongoDB query filters
   * @returns {Promise<number>} Count of matching bookings
   */
  async count(filters = {}) {
    return await Booking.countDocuments(filters);
  }

  /**
   * Check if a booking exists
   * @param {string} id - Booking ID
   * @returns {Promise<boolean>} True if booking exists
   */
  async exists(id) {
    const booking = await Booking.findById(id);
    return !!booking;
  }
}

module.exports = BookingRepository;
