// tests/bookingRoutes.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/labBooking');  
const auth = require('../middleware/auth');  
const bookingRoute = require('../routes/bookingRoutes');  

jest.mock('../models/labBooking');  
jest.mock('../middleware/auth');  

const app = express();
app.use(express.json());
app.use('/booking', bookingRoute);

describe('Booking Route Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockImplementation((req, res, next) => {
      req.user = { role: 'lecturer' };  // Mock user role
      next();
    });
  });

  describe('POST /check-availability', () => {
    test('should return 400 if time slot is already booked', async () => {
      Booking.find.mockResolvedValue([{ _id: 'booking1' }]);
      const response = await request(app).post('/booking/check-availability').send({
        startTime: '2024-06-10T09:00:00Z',
        endTime: '2024-06-10T11:00:00Z'
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Time slot is already booked' });
    });

    test('should return available message if time slot is free', async () => {
      Booking.find.mockResolvedValue([]);
      const response = await request(app).post('/booking/check-availability').send({
        startTime: '2024-06-10T09:00:00Z',
        endTime: '2024-06-10T11:00:00Z'
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Time slot is available' });
    });

    test('should return 500 if there is a server error', async () => {
      Booking.find.mockRejectedValue(new Error('Server error'));
      const response = await request(app).post('/booking/check-availability').send({
        startTime: '2024-06-10T09:00:00Z',
        endTime: '2024-06-10T11:00:00Z'
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });

  describe('POST /', () => {
    test('should return 400 if time slot is already booked', async () => {
      Booking.find.mockResolvedValue([{ _id: 'booking1' }]);
      const response = await request(app).post('/booking').send({
        title: 'New Booking',
        startTime: '2024-06-10T09:00:00Z',
        endTime: '2024-06-10T11:00:00Z',
        description: 'Description',
        attendees: ['attendee1']
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Time slot is already booked' });
    });

    test('should create a new booking if time slot is free', async () => {
      Booking.find.mockResolvedValue([]);
      const mockSave = jest.fn().mockResolvedValue({
        _id: 'newBooking',
        title: 'New Booking',
        startTime: '2024-06-10T09:00:00Z',
        endTime: '2024-06-10T11:00:00Z',
        description: 'Description',
        status: 'pending',
        attendees: ['attendee1']
      });

      Booking.prototype.save = mockSave;

      const response = await request(app).post('/booking').send({
        title: 'New Booking',
        startTime: '2024-06-10T09:00:00Z',
        endTime: '2024-06-10T11:00:00Z',
        description: 'Description',
        attendees: ['attendee1']
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        _id: 'newBooking',
        title: 'New Booking',
        startTime: '2024-06-10T09:00:00Z',
        endTime: '2024-06-10T11:00:00Z',
        description: 'Description',
        status: 'pending',
        attendees: ['attendee1']
      });
    });

    test('should return 500 if there is a server error', async () => {
      Booking.find.mockRejectedValue(new Error('Server error'));
      const response = await request(app).post('/booking').send({
        title: 'New Booking',
        startTime: '2024-06-10T09:00:00Z',
        endTime: '2024-06-10T11:00:00Z',
        description: 'Description',
        attendees: ['attendee1']
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Server error' });
    });
  });
});
