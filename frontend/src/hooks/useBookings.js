import { useState, useCallback } from 'react';
import { bookingService } from '../services';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Custom hook for booking management operations
 * @returns {Object} Booking management state and methods
 */
export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();

  /**
   * Fetch all bookings
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchBookings = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.getBookings(filters);
        setBookings(data);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch bookings';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Fetch booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Result with success status and booking data
   */
  const fetchBookingById = useCallback(
    async bookingId => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.getBookingById(bookingId);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch booking';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Fetch bookings by status
   * @param {string} status - Booking status
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchBookingsByStatus = useCallback(
    async status => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.getBookingsByStatus(status);
        setBookings(data);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch bookings by status';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Fetch bookings by date range
   * @param {Object} dateRange - Date range {startDate, endDate}
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchBookingsByDateRange = useCallback(
    async dateRange => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.getBookingsByDateRange(dateRange);
        setBookings(data);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch bookings by date range';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Fetch user's bookings
   * @param {string} userId - User ID (optional)
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchUserBookings = useCallback(
    async (userId = null) => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.getUserBookings(userId);
        setBookings(data);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch user bookings';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Fetch upcoming bookings
   * @returns {Promise<Object>} Result with success status and data
   */
  const fetchUpcomingBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getUpcomingBookings();
      setBookings(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch upcoming bookings';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Fetch booking statistics
   * @returns {Promise<Object>} Result with success status and stats data
   */
  const fetchBookingStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getBookingStats();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch booking statistics';
      setError(errorMessage);
      showError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  /**
   * Fetch lab schedule
   * @param {string} labId - Lab ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {Promise<Object>} Result with success status and schedule data
   */
  const fetchLabSchedule = useCallback(
    async (labId, date) => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.getLabSchedule(labId, date);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch lab schedule';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Check lab availability
   * @param {Object} availabilityData - Availability check data
   * @returns {Promise<Object>} Result with success status and availability data
   */
  const checkAvailability = useCallback(
    async availabilityData => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.checkAvailability(availabilityData);
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to check availability';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  /**
   * Create new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise<Object>} Result with success status and created booking
   */
  const createBooking = useCallback(
    async bookingData => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.createBooking(bookingData);
        showSuccess('Booking created successfully');
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to create booking';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Update booking
   * @param {string} bookingId - Booking ID
   * @param {Object} updates - Booking updates
   * @returns {Promise<Object>} Result with success status and updated booking
   */
  const updateBooking = useCallback(
    async (bookingId, updates) => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.updateBooking(bookingId, updates);
        showSuccess('Booking updated successfully');
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to update booking';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Edit lab session (legacy endpoint)
   * @param {string} bookingId - Booking ID
   * @param {Object} bookingData - Updated booking data
   * @returns {Promise<Object>} Result with success status
   */
  const editLabSession = useCallback(
    async (bookingId, bookingData) => {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingService.editLabSession(bookingId, bookingData);
        showSuccess('Lab session updated successfully');
        return { success: true, data };
      } catch (err) {
        const errorMessage = err.message || 'Failed to edit lab session';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Cancel booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Result with success status
   */
  const cancelBooking = useCallback(
    async bookingId => {
      try {
        setLoading(true);
        setError(null);
        await bookingService.cancelBooking(bookingId);
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        showSuccess('Booking cancelled successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to cancel booking';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Cancel lab session (legacy endpoint)
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Result with success status
   */
  const cancelLabSession = useCallback(
    async bookingId => {
      try {
        setLoading(true);
        setError(null);
        await bookingService.cancelLabSession(bookingId);
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        showSuccess('Lab session cancelled successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to cancel lab session';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Confirm booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Result with success status
   */
  const confirmBooking = useCallback(
    async bookingId => {
      try {
        setLoading(true);
        setError(null);
        await bookingService.confirmBooking(bookingId);
        showSuccess('Booking confirmed successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to confirm booking';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Approve booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Result with success status
   */
  const approveBooking = useCallback(
    async bookingId => {
      try {
        setLoading(true);
        setError(null);
        await bookingService.approveBooking(bookingId);
        showSuccess('Booking approved successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to approve booking';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Reject booking
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>} Result with success status
   */
  const rejectBooking = useCallback(
    async (bookingId, reason = '') => {
      try {
        setLoading(true);
        setError(null);
        await bookingService.rejectBooking(bookingId, reason);
        showSuccess('Booking rejected successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to reject booking';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  /**
   * Delete booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Result with success status
   */
  const deleteBooking = useCallback(
    async bookingId => {
      try {
        setLoading(true);
        setError(null);
        await bookingService.deleteBooking(bookingId);
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        showSuccess('Booking deleted successfully');
        return { success: true };
      } catch (err) {
        const errorMessage = err.message || 'Failed to delete booking';
        setError(errorMessage);
        showError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    fetchBookingById,
    fetchBookingsByStatus,
    fetchBookingsByDateRange,
    fetchUserBookings,
    fetchUpcomingBookings,
    fetchBookingStats,
    fetchLabSchedule,
    checkAvailability,
    createBooking,
    updateBooking,
    editLabSession,
    cancelBooking,
    cancelLabSession,
    confirmBooking,
    approveBooking,
    rejectBooking,
    deleteBooking,
  };
};
