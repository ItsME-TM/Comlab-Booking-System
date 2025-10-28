import authService from '../authService';
import apiClient from '../apiClient';

// Mock the apiClient
jest.mock('../apiClient');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    test('successfully logs in user and stores token', async () => {
      const mockResponse = {
        user: { id: 1, email: 'test@example.com' },
        token: 'mock-token',
      };

      apiClient.post.mockResolvedValue(mockResponse);

      const credentials = { email: 'test@example.com', password: 'password' };
      const result = await authService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBe('mock-token');
    });

    test('handles login failure', async () => {
      const mockError = new Error('Invalid credentials');
      apiClient.post.mockRejectedValue(mockError);

      const credentials = { email: 'test@example.com', password: 'wrong' };

      await expect(authService.login(credentials)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(localStorage.getItem('token')).toBeNull();
    });

    test('handles login without token in response', async () => {
      const mockResponse = { user: { id: 1, email: 'test@example.com' } };
      apiClient.post.mockResolvedValue(mockResponse);

      const credentials = { email: 'test@example.com', password: 'password' };
      const result = await authService.login(credentials);

      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('register', () => {
    test('successfully registers user', async () => {
      const mockResponse = { user: { id: 1, email: 'test@example.com' } };
      apiClient.post.mockResolvedValue(mockResponse);

      const userData = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
      };

      const result = await authService.register(userData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });

    test('handles registration failure', async () => {
      const mockError = new Error('Email already exists');
      apiClient.post.mockRejectedValue(mockError);

      const userData = { email: 'test@example.com', password: 'password' };

      await expect(authService.register(userData)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('logout', () => {
    test('successfully logs out and clears storage', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      const mockResponse = { message: 'Logged out successfully' };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.logout();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    test('clears storage even when API call fails', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      const mockError = new Error('Server error');
      apiClient.post.mockRejectedValue(mockError);

      await expect(authService.logout()).rejects.toThrow('Server error');
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('refreshToken', () => {
    test('successfully refreshes token', async () => {
      const mockResponse = { token: 'new-token' };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh');
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('token')).toBe('new-token');
    });

    test('handles refresh failure', async () => {
      const mockError = new Error('Token expired');
      apiClient.post.mockRejectedValue(mockError);

      await expect(authService.refreshToken()).rejects.toThrow('Token expired');
    });
  });

  describe('requestPasswordReset', () => {
    test('successfully requests password reset', async () => {
      const mockResponse = { message: 'Reset email sent' };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.requestPasswordReset('test@example.com');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPassword', () => {
    test('successfully resets password', async () => {
      const mockResponse = { message: 'Password reset successfully' };
      apiClient.post.mockResolvedValue(mockResponse);

      const resetData = { token: 'reset-token', password: 'newpassword' };
      const result = await authService.resetPassword(resetData);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/reset-password',
        resetData,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyToken', () => {
    test('successfully verifies token', async () => {
      const mockResponse = { valid: true };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await authService.verifyToken();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/verify');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    test('successfully gets current user', async () => {
      const mockResponse = { user: { id: 1, email: 'test@example.com' } };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse);
    });
  });
});
