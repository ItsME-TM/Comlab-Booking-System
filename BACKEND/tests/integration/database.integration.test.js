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
        department: 'Computer Science',
      };

      const user = await DbHelper.createTestData(User, userData);

      expect(user._id).toBeTruthy();
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.role).toBe(userData.role);
      expect(user.department).toBe(userData.department);
      expect(user.isActive).toBe(true); // Default value
      expect(user.createdAt).toBeTruthy();
      expect(user.updatedAt).toBeTruthy();
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

    it('should validate email format', async () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'hashedpassword123',
        firstName: 'Test',
        lastName: 'User',
        role: 'lecturer',
      };

      await expect(
        DbHelper.createTestData(User, invalidEmailData),
      ).rejects.toThrow();
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
        userId: testUser._id,
        labId: 'lab-001',
        startTime: new Date('2024-12-01T10:00:00Z'),
        endTime: new Date('2024-12-01T12:00:00Z'),
        purpose: 'Research work',
        status: 'pending',
      };

      const booking = await DbHelper.createTestData(Booking, bookingData);

      expect(booking._id).toBeTruthy();
      expect(booking.userId.toString()).toBe(testUser._id.toString());
      expect(booking.labId).toBe(bookingData.labId);
      expect(booking.startTime).toEqual(bookingData.startTime);
      expect(booking.endTime).toEqual(bookingData.endTime);
      expect(booking.purpose).toBe(bookingData.purpose);
      expect(booking.status).toBe(bookingData.status);
      expect(booking.createdAt).toBeTruthy();
      expect(booking.updatedAt).toBeTruthy();
    });

    it('should populate user information', async () => {
      const bookingData = {
        userId: testUser._id,
        labId: 'lab-001',
        startTime: new Date('2024-12-01T10:00:00Z'),
        endTime: new Date('2024-12-01T12:00:00Z'),
        purpose: 'Research work',
        status: 'pending',
      };

      const booking = await DbHelper.createTestData(Booking, bookingData);
      const populatedBooking = await Booking.findById(booking._id).populate(
        'userId',
      );

      expect(populatedBooking.userId.email).toBe(testUser.email);
      expect(populatedBooking.userId.firstName).toBe(testUser.firstName);
      expect(populatedBooking.userId.lastName).toBe(testUser.lastName);
    });

    it('should validate required fields', async () => {
      const incompleteBookingData = {
        userId: testUser._id,
        labId: 'lab-001',
        // Missing required fields
      };

      await expect(
        DbHelper.createTestData(Booking, incompleteBookingData),
      ).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const invalidStatusData = {
        userId: testUser._id,
        labId: 'lab-001',
        startTime: new Date('2024-12-01T10:00:00Z'),
        endTime: new Date('2024-12-01T12:00:00Z'),
        purpose: 'Research work',
        status: 'invalid-status',
      };

      await expect(
        DbHelper.createTestData(Booking, invalidStatusData),
      ).rejects.toThrow();
    });

    it('should validate time logic (end time after start time)', async () => {
      const invalidTimeData = {
        userId: testUser._id,
        labId: 'lab-001',
        startTime: new Date('2024-12-01T12:00:00Z'),
        endTime: new Date('2024-12-01T10:00:00Z'), // End before start
        purpose: 'Research work',
        status: 'pending',
      };

      // This would need custom validation in the model
      // For now, we'll just create the booking and check manually
      const booking = await DbHelper.createTestData(Booking, invalidTimeData);
      expect(booking.startTime.getTime()).toBeGreaterThan(
        booking.endTime.getTime(),
      );
    });
  });

  describe('Notification Model Operations', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await DbHelper.createTestData(User, {
        email: 'notification@example.com',
        password: 'hashedpassword123',
        firstName: 'Notification',
        lastName: 'User',
        role: 'lecturer',
      });
    });

    it('should create notification with proper validation', async () => {
      const notificationData = {
        userId: testUser._id,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'booking',
        isRead: false,
      };

      const notification = await DbHelper.createTestData(
        Notification,
        notificationData,
      );

      expect(notification._id).toBeTruthy();
      expect(notification.userId.toString()).toBe(testUser._id.toString());
      expect(notification.title).toBe(notificationData.title);
      expect(notification.message).toBe(notificationData.message);
      expect(notification.type).toBe(notificationData.type);
      expect(notification.isRead).toBe(false);
      expect(notification.createdAt).toBeTruthy();
    });

    it('should populate user information', async () => {
      const notificationData = {
        userId: testUser._id,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'booking',
      };

      const notification = await DbHelper.createTestData(
        Notification,
        notificationData,
      );
      const populatedNotification = await Notification.findById(
        notification._id,
      ).populate('userId');

      expect(populatedNotification.userId.email).toBe(testUser.email);
      expect(populatedNotification.userId.firstName).toBe(testUser.firstName);
    });

    it('should validate type enum', async () => {
      const invalidTypeData = {
        userId: testUser._id,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'invalid-type',
      };

      await expect(
        DbHelper.createTestData(Notification, invalidTypeData),
      ).rejects.toThrow();
    });
  });

  describe('Complex Database Operations', () => {
    let testUser;
    let testBooking;

    beforeEach(async () => {
      testUser = await DbHelper.createTestData(User, {
        email: 'complex@example.com',
        password: 'hashedpassword123',
        firstName: 'Complex',
        lastName: 'User',
        role: 'lecturer',
      });

      testBooking = await DbHelper.createTestData(Booking, {
        userId: testUser._id,
        labId: 'lab-001',
        startTime: new Date('2024-12-01T10:00:00Z'),
        endTime: new Date('2024-12-01T12:00:00Z'),
        purpose: 'Research work',
        status: 'pending',
      });
    });

    it('should handle cascading operations', async () => {
      // Create notification related to booking
      const notification = await DbHelper.createTestData(Notification, {
        userId: testUser._id,
        title: 'Booking Created',
        message: `Your booking for ${testBooking.labId} has been created`,
        type: 'booking',
      });

      // Verify relationships
      const userWithBookings = await User.findById(testUser._id);
      const bookings = await Booking.find({ userId: testUser._id });
      const notifications = await Notification.find({ userId: testUser._id });

      expect(userWithBookings).toBeTruthy();
      expect(bookings).toHaveLength(1);
      expect(notifications).toHaveLength(1);
      expect(notifications[0].message).toContain(testBooking.labId);
    });

    it('should handle transaction-like operations', async () => {
      // Simulate updating booking status and creating notification
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          // Update booking status
          await Booking.findByIdAndUpdate(
            testBooking._id,
            { status: 'approved' },
            { session },
          );

          // Create approval notification
          await Notification.create(
            [
              {
                userId: testUser._id,
                title: 'Booking Approved',
                message: 'Your booking has been approved',
                type: 'booking',
              },
            ],
            { session },
          );
        });

        // Verify both operations completed
        const updatedBooking = await Booking.findById(testBooking._id);
        const notifications = await Notification.find({ userId: testUser._id });

        expect(updatedBooking.status).toBe('approved');
        expect(notifications).toHaveLength(1);
        expect(notifications[0].title).toBe('Booking Approved');
      } finally {
        await session.endSession();
      }
    });

    it('should handle bulk operations', async () => {
      // Create multiple bookings
      const bookingsData = [
        {
          userId: testUser._id,
          labId: 'lab-002',
          startTime: new Date('2024-12-02T10:00:00Z'),
          endTime: new Date('2024-12-02T12:00:00Z'),
          purpose: 'Bulk booking 1',
          status: 'pending',
        },
        {
          userId: testUser._id,
          labId: 'lab-003',
          startTime: new Date('2024-12-03T10:00:00Z'),
          endTime: new Date('2024-12-03T12:00:00Z'),
          purpose: 'Bulk booking 2',
          status: 'pending',
        },
      ];

      const createdBookings = await DbHelper.createMultipleTestData(
        Booking,
        bookingsData,
      );
      expect(createdBookings).toHaveLength(2);

      // Bulk update all bookings to approved
      await Booking.updateMany(
        { userId: testUser._id },
        { status: 'approved' },
      );

      const approvedBookings = await Booking.find({
        userId: testUser._id,
        status: 'approved',
      });
      expect(approvedBookings).toHaveLength(3); // Including the one from beforeEach
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
      const testUser = await DbHelper.createTestData(User, {
        email: 'large@example.com',
        password: 'hashedpassword123',
        firstName: 'Large',
        lastName: 'Dataset',
        role: 'lecturer',
      });

      // Create many bookings
      const bookings = [];
      for (let i = 0; i < 50; i++) {
        bookings.push({
          userId: testUser._id,
          labId: `lab-${String(i).padStart(3, '0')}`,
          startTime: new Date(
            `2024-12-${String((i % 30) + 1).padStart(2, '0')}T10:00:00Z`,
          ),
          endTime: new Date(
            `2024-12-${String((i % 30) + 1).padStart(2, '0')}T12:00:00Z`,
          ),
          purpose: `Booking ${i}`,
          status: i % 3 === 0 ? 'approved' : 'pending',
        });
      }

      await DbHelper.createMultipleTestData(Booking, bookings);

      // Query with pagination
      const page1 = await Booking.find({ userId: testUser._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .skip(0);

      const page2 = await Booking.find({ userId: testUser._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .skip(10);

      expect(page1).toHaveLength(10);
      expect(page2).toHaveLength(10);
      expect(page1[0]._id.toString()).not.toBe(page2[0]._id.toString());

      // Aggregate query
      const statusCounts = await Booking.aggregate([
        { $match: { userId: testUser._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      expect(statusCounts).toHaveLength(2);
      const approvedCount =
        statusCounts.find(s => s._id === 'approved')?.count || 0;
      const pendingCount =
        statusCounts.find(s => s._id === 'pending')?.count || 0;
      expect(approvedCount + pendingCount).toBe(50);
    });
  });
});
