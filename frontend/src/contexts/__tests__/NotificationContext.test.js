import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  NotificationProvider,
  useNotification,
  NOTIFICATION_TYPES,
} from '../NotificationContext';

describe('NotificationContext', () => {
  test('provides initial state', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      ),
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('addNotification adds notification and updates unread count', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      ),
    });

    const notification = {
      type: NOTIFICATION_TYPES.INFO,
      title: 'Test',
      message: 'Test message',
    };

    act(() => {
      result.current.addNotification(notification);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject(notification);
    expect(result.current.notifications[0]).toHaveProperty('id');
    expect(result.current.notifications[0]).toHaveProperty('timestamp');
    expect(result.current.notifications[0].isRead).toBe(false);
    expect(result.current.unreadCount).toBe(1);
  });

  test('removeNotification removes notification and updates unread count', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      ),
    });

    const notification = {
      type: NOTIFICATION_TYPES.INFO,
      title: 'Test',
      message: 'Test message',
    };

    let notificationId;
    act(() => {
      result.current.addNotification(notification);
      notificationId = result.current.notifications[0].id;
    });

    act(() => {
      result.current.removeNotification(notificationId);
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unreadCount).toBe(0);
  });

  test('markAsRead marks notification as read and updates unread count', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      ),
    });

    const notification = {
      type: NOTIFICATION_TYPES.INFO,
      title: 'Test',
      message: 'Test message',
    };

    let notificationId;
    act(() => {
      result.current.addNotification(notification);
      notificationId = result.current.notifications[0].id;
    });

    act(() => {
      result.current.markAsRead(notificationId);
    });

    expect(result.current.notifications[0].isRead).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  test('markAllAsRead marks all notifications as read', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      ),
    });

    act(() => {
      result.current.addNotification({
        type: NOTIFICATION_TYPES.INFO,
        title: 'Test 1',
        message: 'Message 1',
      });
      result.current.addNotification({
        type: NOTIFICATION_TYPES.INFO,
        title: 'Test 2',
        message: 'Message 2',
      });
    });

    expect(result.current.unreadCount).toBe(2);

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.notifications.every(n => n.isRead)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  test('clearAll removes all notifications', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      ),
    });

    act(() => {
      result.current.addNotification({
        type: NOTIFICATION_TYPES.INFO,
        title: 'Test 1',
        message: 'Message 1',
      });
      result.current.addNotification({
        type: NOTIFICATION_TYPES.INFO,
        title: 'Test 2',
        message: 'Message 2',
      });
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unreadCount).toBe(0);
  });

  test('setNotifications sets notifications and calculates unread count', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      ),
    });

    const notifications = [
      {
        id: '1',
        type: NOTIFICATION_TYPES.INFO,
        title: 'Test 1',
        message: 'Message 1',
        isRead: false,
      },
      {
        id: '2',
        type: NOTIFICATION_TYPES.INFO,
        title: 'Test 2',
        message: 'Message 2',
        isRead: true,
      },
      {
        id: '3',
        type: NOTIFICATION_TYPES.INFO,
        title: 'Test 3',
        message: 'Message 3',
        isRead: false,
      },
    ];

    act(() => {
      result.current.setNotifications(notifications);
    });

    expect(result.current.notifications).toEqual(notifications);
    expect(result.current.unreadCount).toBe(2);
  });

  test('convenience methods create notifications with correct types', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      ),
    });

    act(() => {
      result.current.showSuccess('Success message');
      result.current.showError('Error message');
      result.current.showWarning('Warning message');
      result.current.showInfo('Info message');
    });

    expect(result.current.notifications).toHaveLength(4);
    expect(result.current.notifications[3].type).toBe(
      NOTIFICATION_TYPES.SUCCESS,
    );
    expect(result.current.notifications[2].type).toBe(NOTIFICATION_TYPES.ERROR);
    expect(result.current.notifications[1].type).toBe(
      NOTIFICATION_TYPES.WARNING,
    );
    expect(result.current.notifications[0].type).toBe(NOTIFICATION_TYPES.INFO);
  });

  test('setLoading updates loading state', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      ),
    });

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
  });

  test('setError updates error state and stops loading', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      ),
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
      renderHook(() => useNotification());
    }).toThrow('useNotification must be used within a NotificationProvider');

    console.error = originalError;
  });

  test('notifications are ordered by timestamp (newest first)', () => {
    const { result } = renderHook(() => useNotification(), {
      wrapper: ({ children }) => (
        <NotificationProvider>{children}</NotificationProvider>
      ),
    });

    act(() => {
      result.current.addNotification({
        type: NOTIFICATION_TYPES.INFO,
        title: 'First',
        message: 'First message',
      });
    });

    // Small delay to ensure different timestamps
    setTimeout(() => {
      act(() => {
        result.current.addNotification({
          type: NOTIFICATION_TYPES.INFO,
          title: 'Second',
          message: 'Second message',
        });
      });
    }, 1);

    expect(result.current.notifications[0].title).toBe('Second');
    expect(result.current.notifications[1].title).toBe('First');
  });
});
