// tests/labBooking.test.js
const mongoose = require('mongoose');
const Booking = require('../models/labBooking');  

describe('LabBooking Model Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Schema Validation', () => {
    test('should throw validation error if required fields are missing', async () => {
      const booking = new Booking({});
      let err;

      try {
        await booking.validate();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.title).toBeDefined();
      expect(err.errors.startTime).toBeDefined();
      expect(err.errors.endTime).toBeDefined();
    });

    test('should only accept valid enum values for status field', async () => {
      const booking = new Booking({
        title: 'Test Booking',
        startTime: '2024-06-10T09:00:00Z',
        endTime: '2024-06-10T11:00:00Z',
        status: 'invalidStatus'
      });
      let err;

      try {
        await booking.validate();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.status).toBeDefined();
    });
  });

  describe('Schema Relationships', () => {
    test('should accept an array of valid ObjectIds for attendees field', async () => {
      const validObjectId = mongoose.Types.ObjectId();
      const booking = new Booking({
        title: 'Test Booking',
        startTime: '2024-06-10T09:00:00Z',
        endTime: '2024-06-10T11:00:00Z',
        attendees: [validObjectId]
      });
      let err;

      try {
        await booking.validate();
      } catch (error) {
        err = error;
      }

      expect(err).toBeUndefined();
      expect(booking.attendees[0]).toEqual(validObjectId);
    });

    test('should throw validation error if attendees field contains invalid ObjectIds', async () => {
      const invalidObjectId = '12345';
      const booking = new Booking({
        title: 'Test Booking',
        startTime: '2024-06-10T09:00:00Z',
        endTime: '2024-06-10T11:00:00Z',
        attendees: [invalidObjectId]
      });
      let err;

      try {
        await booking.validate();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors['attendees.0']).toBeDefined();
    });
  });
});
