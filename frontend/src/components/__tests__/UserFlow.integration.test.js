import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/testUtils';
import App from '../../App';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Authentication Flow', () => {
    it('should complete login flow successfully', async () => {
      const user = userEvent.setup();

      // Mock successful login response
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json({
            success: true,
            token: 'mock-jwt-token',
            user: {
              id: '1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              role: 'student'
            }
          });
        })
      );

      render(<App />, {
        userContextValue: {
          user: null,
          login: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          isAuthenticated: false,
          loading: false
        }
      });

      // Navigate to login page (assuming there's a login link)
      const loginLink = screen.getByText(/sign in/i);
      await user.click(loginLink);

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // Wait for login to complete and redirect
      await waitFor(() => {
        expect(screen.queryByText(/dashboard/i)).toBeInTheDocument();
      });
    });

    it('should handle login failure gracefully', async () => {
      const user = userEvent.setup();

      // Mock failed login response
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid credentials'
            },
            { status: 401 }
          );
        })
      );

      render(<App />, {
        userContextValue: {
          user: null,
          login: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          isAuthenticated: false,
          loading: false
        }
      });

      // Navigate to login page
      const loginLink = screen.getByText(/sign in/i);
      await user.click(loginLink);

      // Fill in login form with invalid credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Booking Flow', () => {
    it('should complete booking creation flow', async () => {
      const user = userEvent.setup();

      // Mock successful booking creation
      server.use(
        http.post('/api/bookings', () => {
          return HttpResponse.json({
            success: true,
            message: 'Booking created successfully',
            booking: {
              id: '1',
              userId: '1',
              labId: 'lab-001',
              startTime: '2024-12-01T10:00:00Z',
              endTime: '2024-12-01T12:00:00Z',
              purpose: 'Research work',
              status: 'pending'
            }
          });
        })
      );

      render(<App />);

      // Navigate to booking page
      const bookingLink = screen.getByText(/book lab/i);
      await user.click(bookingLink);

      // Fill in booking form
      const labSelect = screen.getByLabelText(/lab/i);
      const purposeInput = screen.getByLabelText(/purpose/i);
      const startTimeInput = screen.getByLabelText(/start time/i);
      const endTimeInput = screen.getByLabelText(/end time/i);
      const submitButton = screen.getByRole('button', { name: /book lab/i });

      await user.selectOptions(labSelect, 'lab-001');
      await user.type(purposeInput, 'Research work');
      await user.type(startTimeInput, '2024-12-01T10:00');
      await user.type(endTimeInput, '2024-12-01T12:00');
      await user.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/booking created successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle booking conflicts', async () => {
      const user = userEvent.setup();

      // Mock booking conflict response
      server.use(
        http.post('/api/bookings', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Lab is already booked for this time slot'
            },
            { status: 409 }
          );
        })
      );

      render(<App />);

      // Navigate to booking page
      const bookingLink = screen.getByText(/book lab/i);
      await user.click(bookingLink);

      // Fill in booking form
      const labSelect = screen.getByLabelText(/lab/i);
      const purposeInput = screen.getByLabelText(/purpose/i);
      const startTimeInput = screen.getByLabelText(/start time/i);
      const endTimeInput = screen.getByLabelText(/end time/i);
      const submitButton = screen.getByRole('button', { name: /book lab/i });

      await user.selectOptions(labSelect, 'lab-001');
      await user.type(purposeInput, 'Research work');
      await user.type(startTimeInput, '2024-12-01T10:00');
      await user.type(endTimeInput, '2024-12-01T12:00');
      await user.click(submitButton);

      // Wait for conflict error message
      await waitFor(() => {
        expect(screen.getByText(/already booked/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Management Flow', () => {
    it('should complete user profile update flow', async () => {
      const user = userEvent.setup();

      // Mock successful profile update
      server.use(
        http.put('/api/users/1', () => {
          return HttpResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
              id: '1',
              email: 'updated@example.com',
              firstName: 'Updated',
              lastName: 'User',
              role: 'student'
            }
          });
        })
      );

      render(<App />);

      // Navigate to profile page
      const profileLink = screen.getByText(/profile/i);
      await user.click(profileLink);

      // Update profile information
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const updateButton = screen.getByRole('button', { name: /update profile/i });

      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Updated');
      await user.clear(lastNameInput);
      await user.type(lastNameInput, 'User');
      await user.click(updateButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Notification Flow', () => {
    it('should display and manage notifications', async () => {
      const user = userEvent.setup();

      // Mock notifications response
      server.use(
        http.get('/api/notifications', () => {
          return HttpResponse.json({
            success: true,
            notifications: [
              {
                id: '1',
                userId: '1',
                title: 'Booking Approved',
                message: 'Your booking has been approved',
                type: 'booking',
                isRead: false,
                createdAt: '2024-01-15T09:00:00Z'
              }
            ]
          });
        }),
        http.put('/api/notifications/1/read', () => {
          return HttpResponse.json({
            success: true,
            message: 'Notification marked as read'
          });
        })
      );

      render(<App />);

      // Navigate to notifications page
      const notificationLink = screen.getByText(/notifications/i);
      await user.click(notificationLink);

      // Wait for notifications to load
      await waitFor(() => {
        expect(screen.getByText(/booking approved/i)).toBeInTheDocument();
      });

      // Mark notification as read
      const markReadButton = screen.getByRole('button', { name: /mark as read/i });
      await user.click(markReadButton);

      // Wait for read status to update
      await waitFor(() => {
        expect(screen.getByText(/marked as read/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock network error
      server.use(
        http.get('/api/bookings', () => {
          return HttpResponse.error();
        })
      );

      render(<App />);

      // Navigate to bookings page
      const bookingsLink = screen.getByText(/my bookings/i);
      await user.click(bookingsLink);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should handle server errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock server error
      server.use(
        http.get('/api/bookings', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Internal server error'
            },
            { status: 500 }
          );
        })
      );

      render(<App />);

      // Navigate to bookings page
      const bookingsLink = screen.getByText(/my bookings/i);
      await user.click(bookingsLink);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });
  });
});