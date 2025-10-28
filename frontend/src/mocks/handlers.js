import { http, HttpResponse } from 'msw';

// Mock API handlers for testing
export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
      },
    });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: '2',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'student',
      },
    });
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      token: 'new-mock-jwt-token',
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  // User endpoints
  http.get('/api/users', () => {
    return HttpResponse.json({
      success: true,
      users: [
        {
          id: '1',
          email: 'user1@example.com',
          firstName: 'User',
          lastName: 'One',
          role: 'student',
        },
        {
          id: '2',
          email: 'user2@example.com',
          firstName: 'User',
          lastName: 'Two',
          role: 'lecturer',
        },
      ],
    });
  }),

  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      user: {
        id: params.id,
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
      },
    });
  }),

  http.post('/api/users', () => {
    return HttpResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: '3',
        email: 'created@example.com',
        firstName: 'Created',
        lastName: 'User',
        role: 'student',
      },
    });
  }),

  http.put('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: params.id,
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'User',
        role: 'student',
      },
    });
  }),

  http.delete('/api/users/:id', () => {
    return HttpResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  }),

  // Booking endpoints
  http.get('/api/bookings', () => {
    return HttpResponse.json({
      success: true,
      bookings: [
        {
          id: '1',
          userId: '1',
          labId: 'lab-001',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T12:00:00Z',
          purpose: 'Research work',
          status: 'approved',
        },
      ],
    });
  }),

  http.post('/api/bookings', () => {
    return HttpResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: '2',
        userId: '1',
        labId: 'lab-001',
        startTime: '2024-01-16T10:00:00Z',
        endTime: '2024-01-16T12:00:00Z',
        purpose: 'Lab session',
        status: 'pending',
      },
    });
  }),

  http.put('/api/bookings/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: {
        id: params.id,
        status: 'approved',
      },
    });
  }),

  http.delete('/api/bookings/:id', () => {
    return HttpResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  }),

  // Notification endpoints
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
          createdAt: '2024-01-15T09:00:00Z',
        },
      ],
    });
  }),

  http.post('/api/notifications', () => {
    return HttpResponse.json({
      success: true,
      message: 'Notification created successfully',
    });
  }),

  http.put('/api/notifications/:id/read', () => {
    return HttpResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  }),

  // Error handlers for testing error scenarios
  http.get('/api/error/500', () => {
    return new HttpResponse(null, { status: 500 });
  }),

  http.get('/api/error/404', () => {
    return new HttpResponse(null, { status: 404 });
  }),

  http.get('/api/error/401', () => {
    return new HttpResponse(null, { status: 401 });
  }),
];
