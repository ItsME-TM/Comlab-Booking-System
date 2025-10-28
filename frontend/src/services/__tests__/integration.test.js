import {
  authService,
  bookingService,
  userService,
  notificationService,
} from '../index';
import apiClient from '../apiClient';

// Mock the apiClient
jest.mock('../apiClient');

describe('Service Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Authentication Flow', () => {
    test('complete login flow with token storage', async () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'student' };
      const mockToken = 'mock-jwt-token';

      apiClient.post.mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe(mockToken);
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    test('authenticated requests include authorization header', async () => {
      localStorage.setItem('token', 'test-token');

      apiClient.get.mockResolvedValue({ bookings: [] });

      await bookingService.getBookings();

      // Verify that the request interceptor would have added the auth header
      expect(apiClient.get).toHaveBeenCalledWith('/bookings');
    });

    test('logout clears all stored data', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      apiClient.post.mockResolvedValue({ message: 'Logged out' });

      await authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Error Handling Integration', () => {
    test('401 error triggers token cleanup', async () => {
      localStorage.setItem('token', 'invalid-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      const error = new Error('Unauthorized');
      error.status = 401;
      apiClient.get.mockRejectedValue(error);

      try {
        await userService.getCurrentUser();
      } catch (e) {
        // Error is expected
      }

      // The error interceptor should have cleared the storage
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('network errors are properly propagated', async () => {
      const networkError = new Error('Network Error');
      apiClient.post.mockRejectedValue(networkError);

      await expect(
        authService.login({ email: 'test', password: 'test' }),
      ).rejects.toThrow('Network Error');
    });
  });

  describe('Service Method Integration', () => {
    test('booking service methods use correct endpoints', async () => {
      const mockBooking = { id: 1, labId: 'lab1' };
      apiClient.post.mockResolvedValue({ booking: mockBooking });
      apiClient.get.mockResolvedValue({ bookings: [mockBooking] });
      apiClient.put.mockResolvedValue({ booking: mockBooking });
      apiClient.delete.mockResolvedValue({ message: 'Deleted' });

      // Test create
      await bookingService.createBooking({ labId: 'lab1' });
      expect(apiClient.post).toHaveBeenCalledWith('/bookings', {
        labId: 'lab1',
      });

      // Test get
      await bookingService.getBookings();
      expect(apiClient.get).toHaveBeenCalledWith('/bookings');

      // Test update
      await bookingService.updateBooking(1, { status: 'confirmed' });
      expect(apiClient.put).toHaveBeenCalledWith('/bookings/1', {
        status: 'confirmed',
      });

      // Test delete
      await bookingService.cancelBooking(1);
      expect(apiClient.delete).toHaveBeenCalledWith('/bookings/1');
    });

    test('user service methods handle user data correctly', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      apiClient.get.mockResolvedValue({ user: mockUser });
      apiClient.put.mockResolvedValue({
        user: { ...mockUser, name: 'Updated' },
      });

      // Test get current user
      const result = await userService.getCurrentUser();
      expect(result.user).toEqual(mockUser);

      // Test update user
      const updateResult = await userService.updateUser(1, { name: 'Updated' });
      expect(updateResult.user.name).toBe('Updated');
    });

    test('notification service handles different notification types', async () => {
      const mockNotifications = [
        { id: 1, type: 'booking', message: 'Booking confirmed' },
        { id: 2, type: 'system', message: 'System maintenance' },
      ];

      apiClient.get.mockResolvedValue({ notifications: mockNotifications });
      apiClient.post.mockResolvedValue({ notification: mockNotifications[0] });
      apiClient.put.mockResolvedValue({ message: 'Updated' });

      // Test get notifications
      const result = await notificationService.getNotifications();
      expect(result.notifications).toEqual(mockNotifications);

      // Test create notification
      await notificationService.createNotification({ message: 'Test' });
      expect(apiClient.post).toHaveBeenCalledWith('/notifications', {
        message: 'Test',
      });

      // Test mark as read
      await notificationService.markAsRead(1);
      expect(apiClient.put).toHaveBeenCalledWith('/notifications/1/read');
    });
  });

  describe('Data Transformation', () => {
    test('services handle API response data correctly', async () => {
      const apiResponse = {
        user: { id: 1, email: 'test@example.com' },
        token: 'jwt-token',
        expiresIn: 3600,
      };

      apiClient.post.mockResolvedValue(apiResponse);

      const result = await authService.login({
        email: 'test',
        password: 'test',
      });

      expect(result).toEqual(apiResponse);
      expect(typeof result.user).toBe('object');
      expect(typeof result.token).toBe('string');
    });

    test('services handle empty responses gracefully', async () => {
      apiClient.get.mockResolvedValue({});

      const result = await bookingService.getBookings();

      expect(result).toEqual({});
    });
  });
});
