import apiClient from './apiClient';

/**
 * Booking service for handling lab booking operations
 */
class BookingService {
  /**
   * Get all bookings
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} List of bookings
   */
  async getBookings(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/bookings?${queryParams}` : '/bookings';
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch bookings');
    }
  }

  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Booking data
   */
  async getBookingById(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch booking');
    }
  }

  /**
   * Create new booking
   * @param {Object} bookingData - Booking data
   * @param {string} bookingData.labId - Lab ID
   * @param {string} bookingData.startTime - Start time
   * @param {string} bookingData.endTime - End time
   * @param {string} bookingData.purpose - Booking purpose
   * @returns {Promise<Object>} Created booking data
   */
  async createBooking(bookingData) {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create booking');
    }
  }

  /**
   * Update booking
   * @param {string} bookingId - Booking ID
   * @param {Object} updates - Booking updates
   * @returns {Promise<Object>} Updated booking data
   */
  async updateBooking(bookingId, updates) {
    try {
      const response = await apiClient.put(`/bookings/${bookingId}`, updates);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update booking');
    }
  }

  /**
   * Cancel booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelBooking(bookingId) {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/cancel`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to cancel booking');
    }
  }

  /**
   * Delete booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Deletion response
   */
  async deleteBooking(bookingId) {
    try {
      const response = await apiClient.delete(`/bookings/${bookingId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete booking');
    }
  }

  /**
   * Approve booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Approval response
   */
  async approveBooking(bookingId) {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/approve`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to approve booking');
    }
  }

  /**
   * Reject booking
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} Rejection response
   */
  async rejectBooking(bookingId, reason = '') {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/reject`, {
        reason,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to reject booking');
    }
  }

  /**
   * Check lab availability
   * @param {Object} availabilityData - Availability check data
   * @param {string} availabilityData.labId - Lab ID
   * @param {string} availabilityData.startTime - Start time
   * @param {string} availabilityData.endTime - End time
   * @returns {Promise<Object>} Availability response
   */
  async checkAvailability(availabilityData) {
    try {
      const response = await apiClient.post(
        '/bookings/check-availability',
        availabilityData,
      );
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to check availability');
    }
  }

  /**
   * Get user's bookings
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Array>} List of user's bookings
   */
  async getUserBookings(userId = null) {
    try {
      const endpoint = userId
        ? `/bookings/user/${userId}`
        : '/bookings/my-bookings';
      const response = await apiClient.get(endpoint);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user bookings');
    }
  }

  /**
   * Get bookings by date range
   * @param {Object} dateRange - Date range
   * @param {string} dateRange.startDate - Start date
   * @param {string} dateRange.endDate - End date
   * @returns {Promise<Array>} List of bookings in date range
   */
  async getBookingsByDateRange(dateRange) {
    try {
      const queryParams = new URLSearchParams(dateRange).toString();
      const response = await apiClient.get(
        `/bookings/date-range?${queryParams}`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error.message || 'Failed to fetch bookings by date range',
      );
    }
  }

  /**
   * Get lab schedule
   * @param {string} labId - Lab ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Array>} Lab schedule for the date
   */
  async getLabSchedule(labId, date) {
    try {
      const response = await apiClient.get(
        `/bookings/lab/${labId}/schedule?date=${date}`,
      );
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch lab schedule');
    }
  }

  /**
   * Cancel lab session (legacy endpoint)
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelLabSession(bookingId) {
    try {
      const response = await apiClient.post(
        `/bookings/cancelLabSession/${bookingId}`
      );
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to cancel lab session');
    }
  }

  /**
   * Edit lab session (legacy endpoint)
   * @param {string} bookingId - Booking ID
   * @param {Object} bookingData - Updated booking data
   * @returns {Promise<Object>} Update response
   */
  async editLabSession(bookingId, bookingData) {
    try {
      const response = await apiClient.put(
        `/bookings/editLabSession/${bookingId}`,
        bookingData
      );
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to edit lab session');
    }
  }

  /**
   * Get bookings by status
   * @param {string} status - Booking status
   * @returns {Promise<Array>} List of bookings with specified status
   */
  async getBookingsByStatus(status) {
    try {
      const response = await apiClient.get(`/bookings/status/${status}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch bookings by status');
    }
  }

  /**
   * Get booking statistics
   * @returns {Promise<Object>} Booking statistics
   */
  async getBookingStats() {
    try {
      const response = await apiClient.get('/bookings/stats/overview');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch booking statistics');
    }
  }

  /**
   * Get upcoming bookings
   * @returns {Promise<Array>} List of upcoming bookings
   */
  async getUpcomingBookings() {
    try {
      const response = await apiClient.get('/bookings/upcoming/list');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch upcoming bookings');
    }
  }

  /**
   * Confirm booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Confirmation response
   */
  async confirmBooking(bookingId) {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}/confirm`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to confirm booking');
    }
  }
}

// Export singleton instance
export default new BookingService();
