// tests/bookingRoutes.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Booking = require('../models/labBooking');
const bookingRouter = require('../routes/bookingRoutes');

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingRouter);

// Mock auth middleware
jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { role: 'lecturer' };
  next();
});

// Setup in-memory MongoDB server
let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Booking.deleteMany({});
});

describe('Booking Routes', () => {
  describe('POST /check-availability', () => {
    it('should return 400 if time slot is already booked', async () => {
      const booking = new Booking({ title: 'Test', startTime: new Date('2024-06-14T10:00:00Z'), endTime: new Date('2024-06-14T11:00:00Z') });
      await booking.save();

      const response = await request(app)
        .post('/api/bookings/check-availability')
        .send({ startTime: '2024-06-14T10:30:00Z', endTime: '2024-06-14T11:30:00Z' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Time slot is already booked');
    });

    it('should return 200 if time slot is available', async () => {
      const response = await request(app)
        .post('/api/bookings/check-availability')
        .send({ startTime: '2024-06-14T12:00:00Z', endTime: '2024-06-14T13:00:00Z' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Time slot is available');
    });
  });

  describe('POST /', () => {
    it('should create a new booking if time slot is available', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({ title: 'New Booking', startTime: '2024-06-14T12:00:00Z', endTime: '2024-06-14T13:00:00Z', description: 'Test Description', attendees: [] });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New Booking');
    });

    it('should return 400 if time slot is already booked', async () => {
      const booking = new Booking({ title: 'Test', startTime: new Date('2024-06-14T10:00:00Z'), endTime: new Date('2024-06-14T11:00:00Z') });
      await booking.save();

      const response = await request(app)
        .post('/api/bookings')
        .send({ title: 'New Booking', startTime: '2024-06-14T10:30:00Z', endTime: '2024-06-14T11:30:00Z', description: 'Test Description', attendees: [] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Time slot is already booked');
    });
  });

  describe('GET /', () => {
    it('should fetch all bookings', async () => {
      const booking1 = new Booking({ title: 'Test1', startTime: new Date('2024-06-14T10:00:00Z'), endTime: new Date('2024-06-14T11:00:00Z') });
      const booking2 = new Booking({ title: 'Test2', startTime: new Date('2024-06-14T12:00:00Z'), endTime: new Date('2024-06-14T13:00:00Z') });
      await booking1.save();
      await booking2.save();

      const response = await request(app).get('/api/bookings');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a booking by ID', async () => {
      const booking = new Booking({ title: 'Test', startTime: new Date('2024-06-14T10:00:00Z'), endTime: new Date('2024-06-14T11:00:00Z') });
      await booking.save();

      const response = await request(app).delete(`/api/bookings/${booking._id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Booking deleted successfully');
    });

    it('should return 404 if booking not found', async () => {
      const response = await request(app).delete('/api/bookings/60d5ec49c9bf64001c8f26d4');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Booking not found');
    });
  });
});
