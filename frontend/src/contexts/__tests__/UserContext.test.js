import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { UserProvider, useUser } from '../UserContext';

describe('UserContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('provides initial state', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('loads user from localStorage on mount', () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-token');

    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('handles invalid JSON in localStorage', () => {
    localStorage.setItem('user', 'invalid-json');
    localStorage.setItem('token', 'mock-token');

    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('setUser updates state and localStorage', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>
    });

    const mockUser = { id: 1, email: 'test@example.com' };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
  });

  test('updateUser merges updates with existing user', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>
    });

    const initialUser = { id: 1, email: 'test@example.com', name: 'John' };
    const updates = { name: 'Jane', role: 'admin' };

    act(() => {
      result.current.setUser(initialUser);
    });

    act(() => {
      result.current.updateUser(updates);
    });

    const expectedUser = { id: 1, email: 'test@example.com', name: 'Jane', role: 'admin' };
    expect(result.current.user).toEqual(expectedUser);
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(expectedUser);
  });

  test('clearUser resets state and clears localStorage', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>
    });

    const mockUser = { id: 1, email: 'test@example.com' };

    act(() => {
      result.current.setUser(mockUser);
    });

    act(() => {
      result.current.clearUser();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('setLoading updates loading state', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>
    });

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  test('setError updates error state and stops loading', () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => <UserProvider>{children}</UserProvider>
    });

    act(() => {
      result.current.setLoading(true);
    });

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');
    expect(result.current.isLoading).toBe(false);
  });

  test('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useUser());
    }).toThrow('useUser must be used within a UserProvider');

    console.error = originalError;
  });
});