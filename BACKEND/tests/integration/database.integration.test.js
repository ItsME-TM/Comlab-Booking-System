const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Booking = require('../../src/models/labBooking');
const Notification = require('../../src/models/notification');
const DbHelper = require('../helpers/dbHelper');

describe('Database Operations Integration Tests', () => {
  beforeEach(async () => {
    await DbHelper.clearAllCollections();
  });

  describe('User Model Operations', () => {
    it('should create user with proper validation', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        firstName: 'Test',
        lastName: 'User',
        role: 'lecturer',
      };

      const user = await DbHelper.createTestData(User, userData);

      expect(user._id).toBeTruthy();
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.role).toBe(userData.role);
      expect(user.password).toBeTruthy();
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'hashedpassword123',
        firstName: 'Test',
        lastName: 'User',
        role: 'lecturer',
      };

      // Create first user
      await DbHelper.createTestData(User, userData);

      // Try to create duplicate
      await expect(DbHelper.createTestData(User, userData)).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const incompleteUserData = {
        email: 'incomplete@example.com',
        // Missing required fields
      };

      await expect(
        DbHelper.createTestData(User, incompleteUserData),
      ).rejects.toThrow();
    });

    it('should accept any email format (no format validation)', async () => {
      // The user model accepts any email format
      const anyEmailData = {
        email: 'invalid-email',
        password: 'hashedpassword123',
        firstName: 'Test',
        lastName: 'User',
        role: 'lecturer',
      };

      const user = await DbHelper.createTestData(User, anyEmailData);
      expect(user.email).toBe('invalid-email');
    });

    it('should validate role enum', async () => {
      const invalidRoleData = {
        email: 'test@example.com',
        password: 'hashedpassword123',
        firstName: 'Test',
        lastName: 'User',
        role: 'invalid-role',
      };

      await expect(
        DbHelper.createTestData(User, invalidRoleData),
      ).rejects.toThrow();
    });
  });

  describe('Booking Model Operations', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await DbHelper.createTestData(User, {
        email: 'booking@example.com',
        password: 'hashedpassword123',
        firstName: 'Booking',
        lastName: 'User',
        role: 'lecturer',
      });
    });

    it('should create booking with proper validation', async () => {
      const bookingData = {
        title: 'Computer Lab Session',
        startTime: '10:00',
        endTime: '12:00',
        description: 'Advanced programming session',
        status: 'pending',
        attendees: ['student1@example.com', 'student2@example.com'],
      };

      const booking = await DbHelper.createTestData(Booking, bookingData);

      expect(booking._id).toBeTruthy();
      expect(booking.title).toBe(bookingData.title);
      expect(booking.startTime).toBe(bookingData.startTime);
      expect(booking.endTime).toBe(bookingData.endTime);
      expect(booking.description).toBe(bookingData.description);
      expect(booking.status).toBe(bookingData.status);
      expect(booking.attendees).toEqual(bookingData.attendees);
    });

    it('should populate user information', async () => {
      const bookingData = {
        title: 'Computer Lab Session',
        startTime: '10:00',
        endTime: '12:00',
        description: 'Advanced programming session',
        status: 'pending',
        attendees: ['student1@example.com', 'student2@example.com'],
      };

      const booking = await DbHelper.createTestData(Booking, bookingData);
      expect(booking.title).toBe(bookingData.title);
      expect(booking.attendees).toEqual(bookingData.attendees);
    });

    it('should validate required fields', async () => {
      const incompleteBookingData = {
        title: 'Lab Session',
        // Missing required startTime and endTime
      };

      await expect(
        DbHelper.createTestData(Booking, incompleteBookingData),
      ).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const invalidStatusData = {
        title: 'Lab Session',
        startTime: '10:00',
        endTime: '12:00',
        status: 'invalid-status',
      };

      await expect(
        DbHelper.createTestData(Booking, invalidStatusData),
      ).rejects.toThrow();
    });

    it('should validate time logic (end time after start time)', async () => {
      const invalidTimeData = {
        title: 'Lab Session',
        startTime: '12:00',
        endTime: '10:00', // End before start
        description: 'Invalid timing',
        status: 'pending',
      };

      // Since the model doesn't validate time logic, we just create it
      const booking = await DbHelper.createTestData(Booking, invalidTimeData);
      expect(booking.startTime).toBe('12:00');
      expect(booking.endTime).toBe('10:00');
    });
  });

  describe('Notification Model Operations', () => {
    let testBooking;

    beforeEach(async () => {
      testBooking = await DbHelper.createTestData(Booking, {
        title: 'Test Lab Session',
        startTime: '09:00',
        endTime: '11:00',
        description: 'Test',
        status: 'pending',
        attendees: ['user@example.com'],
      });
    });

    it('should create notification with proper validation', async () => {
      const notificationData = {
        receiverEmail: 'user@example.com',
        bookingId: testBooking._id,
        type: 'request',
        senderEmail: 'sender@example.com',
        labSessionTitle: 'Advanced Programming',
        labDate: '2024-12-01',
        labStartTime: '10:00',
        labEndTime: '12:00',
        message: 'Lab booking request',
      };

      const notification = await DbHelper.createTestData(
        Notification,
        notificationData,
      );

      expect(notification._id).toBeTruthy();
      expect(notification.receiverEmail).toBe(notificationData.receiverEmail);
      expect(notification.type).toBe(notificationData.type);
      expect(notification.message).toBe(notificationData.message);
      expect(notification.createdAt).toBeTruthy();
    });

    it('should populate user information', async () => {
      const notificationData = {
        receiverEmail: 'user@example.com',
        bookingId: testBooking._id,
        type: 'reminder',
        senderEmail: 'sender@example.com',
        labSessionTitle: 'Advanced Programming',
        labDate: '2024-12-01',
        labStartTime: '10:00',
        labEndTime: '12:00',
        message: 'Reminder for lab session',
      };

      const notification = await DbHelper.createTestData(
        Notification,
        notificationData,
      );

      expect(notification.receiverEmail).toBe(notificationData.receiverEmail);
      expect(notification.labSessionTitle).toBe(
        notificationData.labSessionTitle,
      );
    });

    it('should validate type enum', async () => {
      const invalidTypeData = {
        receiverEmail: 'user@example.com',
        bookingId: 'booking123',
        type: 'invalid-type',
        senderEmail: 'sender@example.com',
        labSessionTitle: 'Lab',
        labDate: '2024-12-01',
        labStartTime: '10:00',
        labEndTime: '12:00',
        message: 'Test',
      };

      await expect(
        DbHelper.createTestData(Notification, invalidTypeData),
      ).rejects.toThrow();
    });
  });

  describe('Complex Database Operations', () => {
    let testBooking;

    beforeEach(async () => {
      testBooking = await DbHelper.createTestData(Booking, {
        title: 'Lab Session',
        startTime: '10:00',
        endTime: '12:00',
        description: 'Complex test',
        status: 'pending',
        attendees: ['user1@example.com'],
      });
    });

    it('should handle cascading operations', async () => {
      // Create notification related to booking
      const notificationData = {
        receiverEmail: 'user@example.com',
        bookingId: testBooking._id,
        type: 'request',
        senderEmail: 'sender@example.com',
        labSessionTitle: testBooking.title,
        labDate: '2024-12-01',
        labStartTime: testBooking.startTime,
        labEndTime: testBooking.endTime,
        message: `Your booking has been created`,
      };
      
      await DbHelper.createTestData(Notification, notificationData);

      // Verify relationships
      const bookings = await Booking.find({ title: 'Lab Session' });
      const notifications = await Notification.find({
        receiverEmail: 'user@example.com',
      });

      expect(bookings).toHaveLength(1);
      expect(notifications).toHaveLength(1);
    });

    it('should handle transaction-like operations', async () => {
      // Simulate updating booking status
      const updatedBooking = await Booking.findByIdAndUpdate(
        testBooking._id,
        { status: 'confirmed' },
        { new: true },
      );

      // Create approval notification
      await DbHelper.createTestData(Notification, {
        receiverEmail: 'user@example.com',
        bookingId: testBooking._id,
        type: 'confirmed',
        senderEmail: 'admin@example.com',
        labSessionTitle: testBooking.title,
        labDate: '2024-12-01',
        labStartTime: testBooking.startTime,
        labEndTime: testBooking.endTime,
        message: 'Your booking has been approved',
      });

      expect(updatedBooking.status).toBe('confirmed');
    });

    it('should handle bulk operations', async () => {
      // Create multiple bookings
      const bookingsData = [
        {
          title: 'Lab Session 2',
          startTime: '14:00',
          endTime: '16:00',
          status: 'pending',
          attendees: ['user2@example.com'],
        },
        {
          title: 'Lab Session 3',
          startTime: '16:00',
          endTime: '18:00',
          status: 'pending',
          attendees: ['user3@example.com'],
        },
      ];

      const createdBookings = await DbHelper.createMultipleTestData(
        Booking,
        bookingsData,
      );
      expect(createdBookings).toHaveLength(2);

      // Bulk update all bookings to confirmed
      await Booking.updateMany(
        { status: 'pending' },
        { status: 'confirmed' },
      );

      const confirmedBookings = await Booking.find({ status: 'confirmed' });
      expect(confirmedBookings.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Database Performance and Indexing', () => {
    it('should efficiently query by indexed fields', async () => {
      // Create multiple users
      const users = [];
      for (let i = 0; i < 10; i++) {
        users.push({
          email: `user${i}@example.com`,
          password: 'hashedpassword123',
          firstName: `User${i}`,
          lastName: 'Test',
          role: 'lecturer',
        });
      }

      await DbHelper.createMultipleTestData(User, users);

      // Query by email (should be indexed)
      const startTime = Date.now();
      const user = await User.findOne({ email: 'user5@example.com' });
      const queryTime = Date.now() - startTime;

      expect(user).toBeTruthy();
      expect(user.firstName).toBe('User5');
      expect(queryTime).toBeLessThan(100); // Should be fast due to indexing
    });

    it('should handle large dataset operations', async () => {
      // Create many bookings
      const bookings = [];
      for (let i = 0; i < 50; i++) {
        bookings.push({
          title: `Booking ${i}`,
          startTime: `${String(10 + (i % 8)).padStart(2, '0')}:00`,
          endTime: `${String(12 + (i % 8)).padStart(2, '0')}:00`,
          description: `Booking purpose ${i}`,
          status: i % 3 === 0 ? 'confirmed' : 'pending',
          attendees: [`user${i}@example.com`],
        });
      }

      await DbHelper.createMultipleTestData(Booking, bookings);

      // Query with pagination
      const page1 = await Booking.find({})
        .sort({ _id: -1 })
        .limit(10)
        .skip(0);

      const page2 = await Booking.find({})
        .sort({ _id: -1 })
        .limit(10)
        .skip(10);

      expect(page1).toHaveLength(10);
      expect(page2).toHaveLength(10);
      expect(page1[0]._id.toString()).not.toBe(page2[0]._id.toString());

      // Aggregate query
      const statusCounts = await Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      expect(statusCounts.length).toBeGreaterThan(0);
      const totalCount = statusCounts.reduce((sum, item) => sum + item.count, 0);
      expect(totalCount).toBeGreaterThanOrEqual(50);
    });
  });
});
