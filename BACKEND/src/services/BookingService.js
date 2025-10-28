const BookingRepository = require('../repositories/BookingRepository');

/**
 * Service class for managing lab booking operations
 * Handles business logic for creating, updating, and managing bookings
 */
class BookingService {
  constructor() {
    this.bookingRepository = new BookingRepository();
  }

  /**
   * Validate booking data for creation
   * @param {Object} bookingData - Booking data to validate
   * @param {string} bookingData.title - Booking title
   * @param {Date} bookingData.startTime - Booking start time
   * @param {Date} bookingData.endTime - Booking end time
   * @param {Array<string>} [bookingData.attendees] - List of attendee emails
   * @param {string} [bookingData.status] - Booking status
   * @returns {Array<string>} Array of validation error messages
   */
  validateBookingData(bookingData) {
    const errors = [];

    if (!bookingData.title || bookingData.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!bookingData.startTime) {
      errors.push('Start time is required');
    }

    if (!bookingData.endTime) {
      errors.push('End time is required');
    }

    if (bookingData.startTime && bookingData.endTime) {
      const startTime = new Date(bookingData.startTime);
      const endTime = new Date(bookingData.endTime);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        errors.push('Invalid date format for start time or end time');
      } else {
        if (startTime >= endTime) {
          errors.push('End time must be after start time');
        }

        if (startTime < new Date()) {
          errors.push('Start time cannot be in the past');
        }

        // Check if booking duration is reasonable (max 8 hours)
        const durationHours = (endTime - startTime) / (1000 * 60 * 60);
        if (durationHours > 8) {
          errors.push('Booking duration cannot exceed 8 hours');
        }

        if (durationHours < 0.5) {
          errors.push('Booking duration must be at least 30 minutes');
        }
      }
    }

    if (bookingData.attendees && Array.isArray(bookingData.attendees)) {
      if (bookingData.attendees.length === 0) {
        errors.push('At least one attendee is required');
      }

      // Validate attendee emails (skip empty/whitespace-only strings)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      bookingData.attendees.forEach((attendee, index) => {
        if (attendee && attendee.trim().length > 0 && !emailRegex.test(attendee)) {
          errors.push(
            `Invalid email format for attendee ${index + 1}: ${attendee}`,
          );
        }
      });
    }

    if (bookingData.status && !this.isValidStatus(bookingData.status)) {
      errors.push(
        'Invalid status. Must be one of: pending, confirmed, cancelled',
      );
    }

    return errors;
  }

  /**
   * Validate booking data for updates
   * @param {Object} updateData - Update data to validate
   * @param {string} [updateData.title] - Updated booking title
   * @param {Date} [updateData.startTime] - Updated start time
   * @param {Date} [updateData.endTime] - Updated end time
   * @param {string} [updateData.status] - Updated status
   * @returns {Array<string>} Array of validation error messages
   */
  validateUpdateData(updateData) {
    const errors = [];

    if (
      updateData.title !== undefined &&
      updateData.title.trim().length === 0
    ) {
      errors.push('Title cannot be empty');
    }

    if (
      updateData.startTime !== undefined &&
      updateData.endTime !== undefined
    ) {
      const startTime = new Date(updateData.startTime);
      const endTime = new Date(updateData.endTime);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        errors.push('Invalid date format for start time or end time');
      } else if (startTime >= endTime) {
        errors.push('End time must be after start time');
      }
    }

    if (
      updateData.status !== undefined &&
      !this.isValidStatus(updateData.status)
    ) {
      errors.push(
        'Invalid status. Must be one of: pending, confirmed, cancelled',
      );
    }

    return errors;
  }

  /**
   * Check if a status value is valid
   * @param {string} status - Status to validate
   * @returns {boolean} True if status is valid
   */
  isValidStatus(status) {
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    return validStatuses.includes(status);
  }

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data
   * @param {string} bookingData.title - Booking title
   * @param {Date} bookingData.startTime - Start time
   * @param {Date} bookingData.endTime - End time
   * @param {string} [bookingData.description] - Booking description
   * @param {Array<string>} [bookingData.attendees] - Attendee emails
   * @returns {Promise<Object>} Created booking object
   * @throws {Error} If validation fails or time slot is not available
   */
  async createBooking(bookingData) {
    // Validate input data
    const validationErrors = this.validateBookingData(bookingData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check availability
    const isAvailable = await this.checkAvailability(
      bookingData.startTime,
      bookingData.endTime,
    );
    if (!isAvailable.available) {
      throw new Error(`Time slot is not available: ${isAvailable.reason}`);
    }

    // Set default status if not provided
    if (!bookingData.status) {
      bookingData.status = 'pending';
    }

    // Filter out empty attendees
    if (bookingData.attendees) {
      bookingData.attendees = bookingData.attendees.filter(
        attendee => attendee && attendee.trim().length > 0,
      );
    }

    return await this.bookingRepository.create(bookingData);
  }

  /**
   * Get a booking by ID
   * @param {string} id - Booking ID
   * @returns {Promise<Object>} Booking object
   * @throws {Error} If booking not found
   */
  async getBookingById(id) {
    if (!id) {
      throw new Error('Booking ID is required');
    }

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  /**
   * Get all bookings
   * @param {boolean} [includeInactive=false] - Whether to include cancelled bookings
   * @returns {Promise<Array<Object>>} Array of booking objects
   */
  async getAllBookings(includeInactive = false) {
    if (includeInactive) {
      return await this.bookingRepository.findAll();
    }
    return await this.bookingRepository.findActiveBookings();
  }

  /**
   * Get bookings by status
   * @param {string} status - Booking status (pending, confirmed, cancelled)
   * @returns {Promise<Array<Object>>} Array of booking objects
   * @throws {Error} If status is invalid
   */
  async getBookingsByStatus(status) {
    if (!this.isValidStatus(status)) {
      throw new Error('Invalid status specified');
    }

    return await this.bookingRepository.findByStatus(status);
  }

  /**
   * Get bookings within a date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Array<Object>>} Array of booking objects
   * @throws {Error} If dates are invalid or end date is before start date
   */
  async getBookingsByDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }

    if (start >= end) {
      throw new Error('End date must be after start date');
    }

    return await this.bookingRepository.findByDateRange(start, end);
  }

  /**
   * Update a booking
   * @param {string} id - Booking ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.title] - Updated title
   * @param {Date} [updateData.startTime] - Updated start time
   * @param {Date} [updateData.endTime] - Updated end time
   * @param {string} [updateData.description] - Updated description
   * @param {Array<string>} [updateData.attendees] - Updated attendees
   * @returns {Promise<Object>} Updated booking object
   * @throws {Error} If validation fails, booking not found, or time slot unavailable
   */
  async updateBooking(id, updateData) {
    if (!id) {
      throw new Error('Booking ID is required');
    }

    // Validate update data
    const validationErrors = this.validateUpdateData(updateData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check if booking exists
    const existingBooking = await this.bookingRepository.findById(id);
    if (!existingBooking) {
      throw new Error('Booking not found');
    }

    // Check if booking is already cancelled
    if (existingBooking.status === 'cancelled') {
      throw new Error('Cannot update a cancelled booking');
    }

    // If updating time, check availability
    if (updateData.startTime || updateData.endTime) {
      const startTime = updateData.startTime || existingBooking.startTime;
      const endTime = updateData.endTime || existingBooking.endTime;

      const isAvailable = await this.checkAvailability(startTime, endTime, id);
      if (!isAvailable.available) {
        throw new Error(`Time slot is not available: ${isAvailable.reason}`);
      }
    }

    // Filter out empty attendees if provided
    if (updateData.attendees) {
      updateData.attendees = updateData.attendees.filter(
        attendee => attendee && attendee.trim().length > 0,
      );
    }

    return await this.bookingRepository.update(id, updateData);
  }

  /**
   * Cancel a booking
   * @param {string} id - Booking ID
   * @param {string} [userId=null] - User ID performing the cancellation
   * @returns {Promise<Object>} Cancelled booking object
   * @throws {Error} If booking not found or already cancelled
   */
  async cancelBooking(id, userId = null) {
    if (!id) {
      throw new Error('Booking ID is required');
    }

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    return await this.bookingRepository.updateStatus(id, 'cancelled');
  }

  /**
   * Confirm a booking
   * @param {string} id - Booking ID
   * @param {string} [userId=null] - User ID performing the confirmation
   * @returns {Promise<Object>} Confirmed booking object
   * @throws {Error} If booking not found, cancelled, already confirmed, or time slot unavailable
   */
  async confirmBooking(id, userId = null) {
    if (!id) {
      throw new Error('Booking ID is required');
    }

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Cannot confirm a cancelled booking');
    }

    if (booking.status === 'confirmed') {
      throw new Error('Booking is already confirmed');
    }

    // Check if the time slot is still available
    const isAvailable = await this.checkAvailability(
      booking.startTime,
      booking.endTime,
      id,
    );
    if (!isAvailable.available) {
      throw new Error(`Cannot confirm booking: ${isAvailable.reason}`);
    }

    return await this.bookingRepository.updateStatus(id, 'confirmed');
  }

  /**
   * Permanently delete a booking
   * @param {string} id - Booking ID
   * @returns {Promise<Object>} Deleted booking object
   * @throws {Error} If booking not found
   */
  async deleteBooking(id) {
    if (!id) {
      throw new Error('Booking ID is required');
    }

    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    return await this.bookingRepository.delete(id);
  }

  /**
   * Check if a time slot is available for booking
   * @param {Date|string} startTime - Start time to check
   * @param {Date|string} endTime - End time to check
   * @param {string} [excludeBookingId=null] - Booking ID to exclude from conflict check (for updates)
   * @returns {Promise<Object>} Availability result with available flag, reason, and conflicts
   */
  async checkAvailability(startTime, endTime, excludeBookingId = null) {
    if (!startTime || !endTime) {
      return {
        available: false,
        reason: 'Start time and end time are required',
      };
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return {
        available: false,
        reason: 'Invalid date format',
      };
    }

    if (start >= end) {
      return {
        available: false,
        reason: 'End time must be after start time',
      };
    }

    if (start < new Date()) {
      return {
        available: false,
        reason: 'Start time cannot be in the past',
      };
    }

    // Find overlapping bookings
    const overlappingBookings =
      await this.bookingRepository.findOverlappingBookings(startTime, endTime);

    // Filter out the current booking if we're updating
    const conflictingBookings = overlappingBookings.filter(
      booking => booking._id.toString() !== excludeBookingId,
    );

    if (conflictingBookings.length > 0) {
      const activeConflicts = conflictingBookings.filter(
        booking => booking.status !== 'cancelled',
      );

      if (activeConflicts.length > 0) {
        const conflictDetails = activeConflicts.map(booking => ({
          id: booking._id,
          title: booking.title,
          status: booking.status,
          startTime: booking.startTime,
          endTime: booking.endTime,
        }));

        return {
          available: false,
          reason: 'Time slot conflicts with existing bookings',
          conflicts: conflictDetails,
        };
      }
    }

    return {
      available: true,
      reason: 'Time slot is available',
    };
  }

  /**
   * Get booking statistics
   * @returns {Promise<Object>} Statistics object with counts by status
   */
  async getBookingStats() {
    const totalBookings = await this.bookingRepository.count();
    const pendingBookings = await this.bookingRepository.count({
      status: 'pending',
    });
    const confirmedBookings = await this.bookingRepository.count({
      status: 'confirmed',
    });
    const cancelledBookings = await this.bookingRepository.count({
      status: 'cancelled',
    });

    return {
      total: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
    };
  }

  /**
   * Get upcoming bookings
   * @param {number} [limit=10] - Maximum number of bookings to return
   * @returns {Promise<Array<Object>>} Array of upcoming booking objects
   */
  async getUpcomingBookings(limit = 10) {
    const now = new Date();
    const upcomingBookings = await this.bookingRepository.findAll({
      startTime: { $gte: now },
      status: { $ne: 'cancelled' },
    });

    return upcomingBookings
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, limit);
  }

  /**
   * Check if a booking exists
   * @param {string} id - Booking ID
   * @returns {Promise<boolean>} True if booking exists
   */
  async bookingExists(id) {
    return await this.bookingRepository.exists(id);
  }

  /**
   * Get count of bookings matching filters
   * @param {Object} [filters={}] - MongoDB query filters
   * @returns {Promise<number>} Count of matching bookings
   */
  async getBookingCount(filters = {}) {
    return await this.bookingRepository.count(filters);
  }
}

module.exports = BookingService;
