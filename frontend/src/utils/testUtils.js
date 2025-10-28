import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { NotificationContext } from '../contexts/NotificationContext';

// Mock user context value
const mockUserContextValue = {
  user: {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'student'
  },
  login: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn(),
  isAuthenticated: true,
  loading: false
};

// Mock notification context value
const mockNotificationContextValue = {
  notifications: [],
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  markAsRead: jest.fn(),
  clearNotifications: jest.fn(),
  unreadCount: 0
};

// Custom render function that includes providers
const customRender = (ui, options = {}) => {
  const {
    userContextValue = mockUserContextValue,
    notificationContextValue = mockNotificationContextValue,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <UserContext.Provider value={userContextValue}>
        <NotificationContext.Provider value={notificationContextValue}>
          {children}
        </NotificationContext.Provider>
      </UserContext.Provider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Create mock user data
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student',
  department: 'Computer Science',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
});

// Create mock booking data
export const createMockBooking = (overrides = {}) => ({
  id: '1',
  userId: '1',
  labId: 'lab-001',
  startTime: '2024-01-15T10:00:00Z',
  endTime: '2024-01-15T12:00:00Z',
  purpose: 'Research work',
  status: 'approved',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
});

// Create mock notification data
export const createMockNotification = (overrides = {}) => ({
  id: '1',
  userId: '1',
  title: 'Test Notification',
  message: 'This is a test notification',
  type: 'booking',
  isRead: false,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides
});

// Wait for async operations to complete
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Mock API responses
export const mockApiResponse = (data, success = true) => ({
  success,
  ...data
});

// Mock error response
export const mockErrorResponse = (message = 'An error occurred', status = 500) => ({
  success: false,
  message,
  status
});

// Export everything including the custom render
export * from '@testing-library/react';
export { customRender as render };
export { mockUserContextValue, mockNotificationContextValue };