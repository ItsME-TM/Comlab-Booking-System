const BookingService = require('../services/BookingService');
const NotificationService = require('../services/NotificationService');

/**
 * Controller class for handling booking operations
 * Manages HTTP requests for creating, updating, and managing lab bookings
 */
class BookingController {
  constructor() {
    this.bookingService = new BookingService();
    // Note: NotificationService will be implemented in the next phase
    // this.notificationService = new NotificationService();
  }

  /**
   * Check if user has permission to manage bookings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void}
   */
  checkBookingPermission(req, res, next) {
    if (
      req.user.role !== 'lecturer' &&
      req.user.role !== 'instructor' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        error: "Access denied. You're not authorized to manage lab bookings.",
      });
    }
    next();
  }

  /**
   * Check availability of a time slot
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {Date} req.body.startTime - Start time to check
   * @param {Date} req.body.endTime - End time to check
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async checkAvailability(req, res) {
    try {
      const { startTime, endTime } = req.body;

      if (!startTime || !endTime) {
        return res
          .status(400)
          .json({ error: 'Start time and end time are required' });
      }

      const availability = await this.bookingService.checkAvailability(
        startTime,
        endTime,
      );

      if (availability.available) {
        res.json({
          message: availability.reason,
          available: true,
        });
      } else {
        const statusCode = availability.conflicts ? 400 : 422;
        res.status(statusCode).json({
          error: availability.reason,
          available: false,
          conflicts: availability.conflicts || [],
        });
      }
    } catch (error) {
      console.error('Check availability error:', error);
      res
        .status(500)
        .json({ error: 'Server error while checking availability' });
    }
  }

  /**
   * Create a new booking
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body with booking data
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async createBooking(req, res) {
    try {
      const { title, startTime, endTime, description, attendees } = req.body;

      const bookingData = {
        title,
        startTime,
        endTime,
        description,
        attendees: attendees || [],
      };

      const booking = await this.bookingService.createBooking(bookingData);

      // TODO: Send notifications to attendees when NotificationService is implemented
      // await this.notificationService.sendBookingNotifications(booking);

      res.status(201).json({
        message: 'Booking created successfully',
        booking,
      });
    } catch (error) {
      console.error('Create booking error:', error);

      if (
        error.message.includes('Validation failed') ||
        error.message.includes('not available')
      ) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Server error while creating booking' });
    }
  }

  /**
   * Get all bookings
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {string} [req.query.includeInactive] - Whether to include cancelled bookings
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async getAllBookings(req, res) {
    try {
      const { includeInactive } = req.query;
      const bookings = await this.bookingService.getAllBookings(
        includeInactive === 'true',
      );

      res.json({
        message: 'Bookings retrieved successfully',
        bookings,
        count: bookings.length,
      });
    } catch (error) {
      console.error('Get all bookings error:', error);
      res.status(500).json({ error: 'Server error while retrieving bookings' });
    }
  }

  /**
   * Get a booking by ID
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Booking ID
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const booking = await this.bookingService.getBookingById(id);

      res.json({
        message: 'Booking retrieved successfully',
        booking,
      });
    } catch (error) {
      console.error('Get booking by ID error:', error);

      if (error.message === 'Booking not found') {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.status(500).json({ error: 'Server error while retrieving booking' });
    }
  }

  // Get bookings by status
  async getBookingsByStatus(req, res) {
    try {
      const { status } = req.params;
      const bookings = await this.bookingService.getBookingsByStatus(status);

      res.json({
        message: `${status} bookings retrieved successfully`,
        bookings,
        count: bookings.length,
      });
    } catch (error) {
      console.error('Get bookings by status error:', error);

      if (error.message.includes('Invalid status')) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Server error while retrieving bookings' });
    }
  }

  // Get bookings by date range
  async getBookingsByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: 'Start date and end date are required' });
      }

      const bookings = await this.bookingService.getBookingsByDateRange(
        startDate,
        endDate,
      );

      res.json({
        message: 'Bookings retrieved successfully',
        bookings,
        count: bookings.length,
        dateRange: { startDate, endDate },
      });
    } catch (error) {
      console.error('Get bookings by date range error:', error);

      if (error.message.includes('date') || error.message.includes('Invalid')) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Server error while retrieving bookings' });
    }
  }

  /**
   * Update a booking
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Booking ID
   * @param {Object} req.body - Request body with update data
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async updateBooking(req, res) {
    try {
      const { id } = req.params;
      const { title, startTime, endTime, description, attendees } = req.body;

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (startTime !== undefined) updateData.startTime = startTime;
      if (endTime !== undefined) updateData.endTime = endTime;
      if (description !== undefined) updateData.description = description;
      if (attendees !== undefined) updateData.attendees = attendees;

      const booking = await this.bookingService.updateBooking(id, updateData);

      // TODO: Send update notifications when NotificationService is implemented
      // await this.notificationService.sendBookingUpdateNotifications(booking);

      res.json({
        message: 'Booking updated successfully',
        booking,
      });
    } catch (error) {
      console.error('Update booking error:', error);

      if (
        error.message.includes('Validation failed') ||
        error.message.includes('not found') ||
        error.message.includes('not available') ||
        error.message.includes('cancelled')
      ) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Server error while updating booking' });
    }
  }

  /**
   * Cancel a booking
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Booking ID
   * @param {Object} req.user - Authenticated user
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const booking = await this.bookingService.cancelBooking(id, req.user._id);

      // TODO: Send cancellation notifications when NotificationService is implemented
      // await this.notificationService.sendBookingCancellationNotifications(booking);

      res.json({
        message: 'Booking cancelled successfully',
        booking,
      });
    } catch (error) {
      console.error('Cancel booking error:', error);

      if (
        error.message.includes('not found') ||
        error.message.includes('already cancelled')
      ) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Server error while cancelling booking' });
    }
  }

  // Confirm booking
  async confirmBooking(req, res) {
    try {
      const { id } = req.params;
      const booking = await this.bookingService.confirmBooking(
        id,
        req.user._id,
      );

      // TODO: Send confirmation notifications when NotificationService is implemented
      // await this.notificationService.sendBookingConfirmationNotifications(booking);

      res.json({
        message: 'Booking confirmed successfully',
        booking,
      });
    } catch (error) {
      console.error('Confirm booking error:', error);

      if (
        error.message.includes('not found') ||
        error.message.includes('cancelled') ||
        error.message.includes('already confirmed') ||
        error.message.includes('Cannot confirm')
      ) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Server error while confirming booking' });
    }
  }

  // Delete booking permanently
  async deleteBooking(req, res) {
    try {
      const { id } = req.params;

      // Only admins should be able to permanently delete bookings
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error:
            'Access denied. Only administrators can permanently delete bookings.',
        });
      }

      await this.bookingService.deleteBooking(id);

      res.json({
        message: 'Booking deleted permanently',
      });
    } catch (error) {
      console.error('Delete booking error:', error);

      if (error.message === 'Booking not found') {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.status(500).json({ error: 'Server error while deleting booking' });
    }
  }

  // Get booking statistics
  async getBookingStats(req, res) {
    try {
      // Only admins and lecturers should access stats
      if (req.user.role !== 'admin' && req.user.role !== 'lecturer') {
        return res.status(403).json({
          error:
            "Access denied. You're not authorized to view booking statistics.",
        });
      }

      const stats = await this.bookingService.getBookingStats();

      res.json({
        message: 'Booking statistics retrieved successfully',
        stats,
      });
    } catch (error) {
      console.error('Get booking stats error:', error);
      res
        .status(500)
        .json({ error: 'Server error while retrieving statistics' });
    }
  }

  // Get upcoming bookings
  async getUpcomingBookings(req, res) {
    try {
      const { limit } = req.query;
      const bookings = await this.bookingService.getUpcomingBookings(
        limit ? parseInt(limit) : 10,
      );

      res.json({
        message: 'Upcoming bookings retrieved successfully',
        bookings,
        count: bookings.length,
      });
    } catch (error) {
      console.error('Get upcoming bookings error:', error);
      res
        .status(500)
        .json({ error: 'Server error while retrieving upcoming bookings' });
    }
  }

  // Legacy method for compatibility with existing frontend
  async cancelLabSession(req, res) {
    try {
      const { bookingId } = req.params;
      const booking = await this.bookingService.cancelBooking(
        bookingId,
        req.user._id,
      );

      // TODO: Update notifications when NotificationService is implemented
      // const updatedNotifications = await this.notificationService.updateBookingNotifications(
      //   bookingId,
      //   { IsLabWillGoingOn: false, type: 'cancellation', isRead: false }
      // );

      res.json({
        message: 'Lab session cancelled successfully',
        booking,
        // updatedNotifications
      });
    } catch (error) {
      console.error('Cancel lab session error:', error);

      if (
        error.message.includes('not found') ||
        error.message.includes('already cancelled')
      ) {
        return res.status(400).json({ error: error.message });
      }

      res
        .status(500)
        .json({ error: 'Server error while cancelling lab session' });
    }
  }

  // Legacy method for compatibility with existing frontend
  async editLabSession(req, res) {
    try {
      const { bookingId } = req.params;
      const { title, startTime, endTime, description, attendees } = req.body;

      const updateData = {
        title,
        startTime,
        endTime,
        description,
        attendees: attendees || [],
      };

      const booking = await this.bookingService.updateBooking(
        bookingId,
        updateData,
      );

      // TODO: Update notifications when NotificationService is implemented
      // await this.notificationService.updateLabSessionNotifications(booking);

      res.json({
        message: 'Lab session updated successfully',
        updatedLab: booking,
      });
    } catch (error) {
      console.error('Edit lab session error:', error);

      if (
        error.message.includes('Validation failed') ||
        error.message.includes('not found') ||
        error.message.includes('not available')
      ) {
        return res.status(400).json({ error: error.message });
      }

      res
        .status(500)
        .json({ error: 'Server error while updating lab session' });
    }
  }
}

module.exports = BookingController;
