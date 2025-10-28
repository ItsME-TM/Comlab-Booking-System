import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { UserProvider } from '../../contexts/UserContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { authService } from '../../services';

// Mock the auth service
jest.mock('../../services', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn()
  }
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <NotificationProvider>
    <UserProvider>
      {children}
    </UserProvider>
  </NotificationProvider>
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('returns initial state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.register).toBe('function');
  });

  describe('login', () => {
    test('successful login', async () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'student' };
      authService.login.mockResolvedValue({ user: mockUser, token: 'mock-token' });

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login({ 
          email: 'test@example.com', 
          password: 'password' 
        });
      });

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
      expect(loginResult.success).toBe(true);
      expect(loginResult.user).toEqual(mockUser);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    test('failed login', async () => {
      const errorMessage = 'Invalid credentials';
      authService.login.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login({ 
          email: 'test@example.com', 
          password: 'wrong' 
        });
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe(errorMessage);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    test('successful logout', async () => {
      authService.logout.mockResolvedValue({ message: 'Logged out' });

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      let logoutResult;
      await act(async () => {
        logoutResult = await result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(logoutResult.success).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    test('logout with API failure still clears user', async () => {
      authService.logout.mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      let logoutResult;
      await act(async () => {
        logoutResult = await result.current.logout();
      });

      expect(logoutResult.success).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    test('successful registration', async () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'student' };
      authService.register.mockResolvedValue({ user: mockUser });

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      const userData = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      let registerResult;
      await act(async () => {
        registerResult = await result.current.register(userData);
      });

      expect(authService.register).toHaveBeenCalledWith(userData);
      expect(registerResult.success).toBe(true);
      expect(registerResult.user).toEqual(mockUser);
    });

    test('failed registration', async () => {
      const errorMessage = 'Email already exists';
      authService.register.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      let registerResult;
      await act(async () => {
        registerResult = await result.current.register({
          email: 'test@example.com',
          password: 'password'
        });
      });

      expect(registerResult.success).toBe(false);
      expect(registerResult.error).toBe(errorMessage);
    });
  });

  describe('checkAuthStatus', () => {
    test('restores user from localStorage', () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'student' };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      const isAuthenticated = result.current.checkAuthStatus();
      expect(isAuthenticated).toBe(true);
    });

    test('handles invalid user data in localStorage', () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', 'invalid-json');

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      const isAuthenticated = result.current.checkAuthStatus();
      expect(isAuthenticated).toBe(false);
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('role checking', () => {
    test('hasRole returns correct result', () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'admin' };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      expect(result.current.hasRole('admin')).toBe(true);
      expect(result.current.hasRole('student')).toBe(false);
    });

    test('hasAnyRole returns correct result', () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'lecturer' };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      expect(result.current.hasAnyRole(['admin', 'lecturer'])).toBe(true);
      expect(result.current.hasAnyRole(['admin', 'student'])).toBe(false);
    });

    test('role checking with no user returns false', () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      expect(result.current.hasRole('admin')).toBe(false);
      expect(result.current.hasAnyRole(['admin', 'student'])).toBe(false);
    });
  });
});