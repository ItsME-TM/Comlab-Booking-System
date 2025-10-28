import bookingService from '../bookingService';
import apiClient from '../apiClient';

// Mock the apiClient
jest.mock('../apiClient');

describe('BookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBookings', () => {
    test('successfully retrieves bookings', async () => {
      const mockBookings = [
        { id: 1, labId: 'lab1', userId: 1, startTime: '2024-01-01T10:00:00Z' },
        { id: 2, labId: 'lab2', userId: 2, startTime: '2024-01-02T14:00:00Z' }
      ];
      
      apiClient.get.mockResolvedValue({ bookings: mockBookings });
      
      const result = await bookingService.getBookings();
      
      expect(apiClient.get).toHaveBeenCalledWith('/bookings');
      expect(result.bookings).toEqual(mockBookings);
    });

    test('handles get bookings failure', async () => {
      const mockError = new Error('Failed to fetch bookings');
      apiClient.get.mockRejectedValue(mockError);
      
      await expect(bookingService.getBookings()).rejects.toThrow('Failed to fetch bookings');
    });
  });

  describe('createBooking', () => {
    test('successfully creates booking', async () => {
      const mockBooking = { id: 1, labId: 'lab1', userId: 1, startTime: '2024-01-01T10:00:00Z' };
      const bookingData = { labId: 'lab1', startTime: '2024-01-01T10:00:00Z', endTime: '2024-01-01T12:00:00Z' };
      
      apiClient.post.mockResolvedValue({ booking: mockBooking });
      
      const result = await bookingService.createBooking(bookingData);
      
      expect(apiClient.post).toHaveBeenCalledWith('/bookings', bookingData);
      expect(result.booking).toEqual(mockBooking);
    });

    test('handles create booking failure', async () => {
      const mockError = new Error('Booking conflict');
      const bookingData = { labId: 'lab1', startTime: '2024-01-01T10:00:00Z' };
      
      apiClient.post.mockRejectedValue(mockError);
      
      await expect(bookingService.createBooking(bookingData)).rejects.toThrow('Booking conflict');
    });
  });

  describe('updateBooking', () => {
    test('successfully updates booking', async () => {
      const mockBooking = { id: 1, labId: 'lab1', userId: 1, startTime: '2024-01-01T11:00:00Z' };
      const updates = { startTime: '2024-01-01T11:00:00Z' };
      
      apiClient.put.mockResolvedValue({ booking: mockBooking });
      
      const result = await bookingService.updateBooking(1, updates);
      
      expect(apiClient.put).toHaveBeenCalledWith('/bookings/1', updates);
      expect(result.booking).toEqual(mockBooking);
    });
  });

  describe('cancelBooking', () => {
    test('successfully cancels booking', async () => {
      const mockResponse = { message: 'Booking cancelled successfully' };
      
      apiClient.delete.mockResolvedValue(mockResponse);
      
      const result = await bookingService.cancelBooking(1);
      
      expect(apiClient.delete).toHaveBeenCalledWith('/bookings/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkAvailability', () => {
    test('successfully checks availability', async () => {
      const mockResponse = { available: true };
      const params = { labId: 'lab1', startTime: '2024-01-01T10:00:00Z', endTime: '2024-01-01T12:00:00Z' };
      
      apiClient.get.mockResolvedValue(mockResponse);
      
      const result = await bookingService.checkAvailability(params);
      
      expect(apiClient.get).toHaveBeenCalledWith('/bookings/availability', { params });
      expect(result).toEqual(mockResponse);
    });
  });
});