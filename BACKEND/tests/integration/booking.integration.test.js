const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Booking = require('../../src/models/Booking');
const DbHelper = require('../helpers/dbHelper');

describe('Booking Integration Tests', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    await DbHelper.clearAllCollections();

    // Create and authenticate a test user
    const userData = {
      email: 'booking@example.com',
      password: 'password123',
      firstName: 'Booking',
      lastName: 'User',
      role: 'student'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    testUser = registerResponse.body.user;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password });

    authToken = loginResponse.body.token;
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking successfully', async () => {
      const bookingData = {
        labId: 'lab-001',
        startTime: '2024-12-01T10:00:00Z',
        endTime: '2024-12-01T12:00:00Z',
        purpose: 'Research work'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Booking created successfully');
      expect(response.body.booking.labId).toBe(bookingData.labId);
      expect(response.body.booking.purpose).toBe(bookingData.purpose);
      expect(response.body.booking.status).toBe('pending');

      // Verify booking was created in database
      const bookingInDb = await Booking.findById(response.body.booking.id);
      expect(bookingInDb).toBeTruthy();
      expect(bookingInDb.userId.toString()).toBe(testUser.id);
    });

    it('should not create booking without authentication', async () => {
      const bookingData = {
        labId: 'lab-001',
        startTime: '2024-12-01T10:00:00Z',
        endTime: '2024-12-01T12:00:00Z',
        purpose: 'Research work'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          labId: 'lab-001'
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should not create overlapping bookings', async () => {
      const bookingData = {
        labId: 'lab-001',
        startTime: '2024-12-01T10:00:00Z',
        endTime: '2024-12-01T12:00:00Z',
        purpose: 'First booking'
      };

      // Create first booking
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      // Try to create overlapping booking
      const overlappingBooking = {
        ...bookingData,
        startTime: '2024-12-01T11:00:00Z',
        endTime: '2024-12-01T13:00:00Z',
        purpose: 'Overlapping booking'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(overlappingBooking)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('conflict');
    });
  });

  describe('GET /api/bookings', () => {
    beforeEach(async () => {
      // Create test bookings
      const bookings = [
        {
          userId: testUser.id,
          labId: 'lab-001',
          startTime: new Date('2024-12-01T10:00:00Z'),
          endTime: new Date('2024-12-01T12:00:00Z'),
          purpose: 'Booking 1',
          status: 'approved'
        },
        {
          userId: testUser.id,
          labId: 'lab-002',
          startTime: new Date('2024-12-02T14:00:00Z'),
          endTime: new Date('2024-12-02T16:00:00Z'),
          purpose: 'Booking 2',
          status: 'pending'
        }
      ];

      await DbHelper.createMultipleTestData(Booking, bookings);
    });

    it('should get user bookings successfully', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.bookings).toHaveLength(2);
      expect(response.body.bookings[0].purpose).toBe('Booking 1');
      expect(response.body.bookings[1].purpose).toBe('Booking 2');
    });

    it('should filter bookings by status', async () => {
      const response = await request(app)
        .get('/api/bookings?status=approved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.bookings).toHaveLength(1);
      expect(response.body.bookings[0].status).toBe('approved');
    });

    it('should not get bookings without authentication', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    let bookingId;

    beforeEach(async () => {
      const booking = await DbHelper.createTestData(Booking, {
        userId: testUser.id,
        labId: 'lab-001',
        startTime: new Date('2024-12-01T10:00:00Z'),
        endTime: new Date('2024-12-01T12:00:00Z'),
        purpose: 'Original purpose',
        status: 'pending'
      });
      bookingId = booking._id.toString();
    });

    it('should update booking successfully', async () => {
      const updateData = {
        purpose: 'Updated purpose',
        startTime: '2024-12-01T11:00:00Z',
        endTime: '2024-12-01T13:00:00Z'
      };

      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Booking updated successfully');
      expect(response.body.booking.purpose).toBe(updateData.purpose);

      // Verify update in database
      const updatedBooking = await Booking.findById(bookingId);
      expect(updatedBooking.purpose).toBe(updateData.purpose);
    });

    it('should not update non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ purpose: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    let bookingId;

    beforeEach(async () => {
      const booking = await DbHelper.createTestData(Booking, {
        userId: testUser.id,
        labId: 'lab-001',
        startTime: new Date('2024-12-01T10:00:00Z'),
        endTime: new Date('2024-12-01T12:00:00Z'),
        purpose: 'To be deleted',
        status: 'pending'
      });
      bookingId = booking._id.toString();
    });

    it('should cancel booking successfully', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Booking cancelled successfully');

      // Verify booking status changed to cancelled
      const cancelledBooking = await Booking.findById(bookingId);
      expect(cancelledBooking.status).toBe('cancelled');
    });

    it('should not cancel non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});