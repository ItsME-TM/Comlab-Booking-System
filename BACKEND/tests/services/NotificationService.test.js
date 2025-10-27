const NotificationService = require('../../src/services/NotificationService');
const NotificationRepository = require('../../src/repositories/NotificationRepository');
const nodemailer = require('nodemailer');

// Mock dependencies
jest.mock('../../src/repositories/NotificationRepository');
jest.mock('nodemailer');

describe('NotificationService', () => {
  let notificationService;
  let mockNotificationRepository;
  let mockEmailTransporter;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock email transporter
    mockEmailTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    };
    nodemailer.createTransporter.mockReturnValue(mockEmailTransporter);
    
    // Mock repository
    mockNotificationRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByReceiver: jest.fn(),
      findBySender: jest.fn(),
      findByBookingId: jest.fn(),
      updateById: jest.fn(),
      updateByBookingId: jest.fn(),
      markAsRead: jest.fn(),
      updateNotificationsByDate: jest.fn()
    };
    NotificationRepository.mockImplementation(() => mockNotificationRepository);
    
    // Set environment variables
    process.env.EMAIL_ENABLED = 'false';
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'testpass';
    
    notificationService = new NotificationService();
  });

  describe('createNotification', () => {
    it('should successfully create a notification', async () => {
      const notificationData = {
        receiverEmail: 'user@example.com',
        bookingId: 'booking123',
        senderEmail: 'sender@example.com',
        labSessionTitle: 'Test Lab',
        labDate: '2024-01-15',
        labStartTime: '10:00',
        labEndTime: '12:00',
        message: 'Test message',
        type: 'request'
      };

      const mockNotification = { _id: 'notification123', ...notificationData };
      mockNotificationRepository.create.mockResolvedValue(mockNotification);

      const result = await notificationService.createNotification(notificationData);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(notificationData);
      expect(result).toEqual(mockNotification);
    });

    it('should send email when email is enabled', async () => {
      process.env.EMAIL_ENABLED = 'true';
      
      const notificationData = {
        receiverEmail: 'user@example.com',
        type: 'request',
        labSessionTitle: 'Test Lab'
      };

      const mockNotification = { _id: 'notification123', ...notificationData };
      mockNotificationRepository.create.mockResolvedValue(mockNotification);

      await notificationService.createNotification(notificationData);

      expect(mockEmailTransporter.sendMail).toHaveBeenCalled();
    });

    it('should throw error when notification creation fails', async () => {
      const notificationData = { receiverEmail: 'user@example.com' };
      mockNotificationRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(notificationService.createNotification(notificationData))
        .rejects.toThrow('Failed to create notification: Database error');
    });
  });

  describe('createBulkNotifications', () => {
    it('should create notifications for multiple attendees', async () => {
      const attendees = ['user1@example.com', 'user2@example.com'];
      const notificationTemplate = {
        bookingId: 'booking123',
        senderEmail: 'sender@example.com',
        labSessionTitle: 'Test Lab',
        type: 'request'
      };

      const mockNotifications = [
        { _id: 'notification1', receiverEmail: 'user1@example.com', ...notificationTemplate },
        { _id: 'notification2', receiverEmail: 'user2@example.com', ...notificationTemplate }
      ];

      mockNotificationRepository.create
        .mockResolvedValueOnce(mockNotifications[0])
        .mockResolvedValueOnce(mockNotifications[1]);

      const result = await notificationService.createBulkNotifications(attendees, notificationTemplate);

      expect(mockNotificationRepository.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result[0].receiverEmail).toBe('user1@example.com');
      expect(result[1].receiverEmail).toBe('user2@example.com');
    });
  });

  describe('getNotificationsByReceiver', () => {
    it('should get notifications by receiver email', async () => {
      const receiverEmail = 'user@example.com';
      const mockNotifications = [
        { _id: 'notification1', receiverEmail, type: 'request' },
        { _id: 'notification2', receiverEmail, type: 'confirmed' }
      ];

      mockNotificationRepository.findByReceiver.mockResolvedValue(mockNotifications);

      const result = await notificationService.getNotificationsByReceiver(receiverEmail);

      expect(mockNotificationRepository.findByReceiver).toHaveBeenCalledWith(receiverEmail, {});
      expect(result).toEqual(mockNotifications);
    });

    it('should exclude specified types', async () => {
      const receiverEmail = 'user@example.com';
      const excludeTypes = ['booking_confirmation'];

      await notificationService.getNotificationsByReceiver(receiverEmail, excludeTypes);

      expect(mockNotificationRepository.findByReceiver).toHaveBeenCalledWith(
        receiverEmail, 
        { type: { $nin: excludeTypes } }
      );
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = 'notification123';
      const userEmail = 'user@example.com';
      const mockNotification = { _id: notificationId, isRead: true };

      mockNotificationRepository.markAsRead.mockResolvedValue(mockNotification);

      const result = await notificationService.markNotificationAsRead(notificationId, userEmail);

      expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith(notificationId, userEmail);
      expect(result).toEqual(mockNotification);
    });

    it('should throw error when notification not found', async () => {
      const notificationId = 'notification123';
      const userEmail = 'user@example.com';

      mockNotificationRepository.markAsRead.mockResolvedValue(null);

      await expect(notificationService.markNotificationAsRead(notificationId, userEmail))
        .rejects.toThrow('Failed to mark notification as read: Notification not found or access denied');
    });
  });

  describe('acceptNotification', () => {
    it('should accept notification successfully', async () => {
      const notificationId = 'notification123';
      const userEmail = 'user@example.com';
      const mockNotification = {
        _id: notificationId,
        receiverEmail: userEmail,
        isReceiverConfirm: true,
        type: 'booking_confirmation'
      };

      mockNotificationRepository.updateById.mockResolvedValue(mockNotification);

      const result = await notificationService.acceptNotification(notificationId, userEmail);

      expect(mockNotificationRepository.updateById).toHaveBeenCalledWith(notificationId, {
        isReceiverConfirm: true,
        type: 'booking_confirmation',
        isRead: false
      });
      expect(result).toEqual(mockNotification);
    });

    it('should throw error when notification not found or access denied', async () => {
      const notificationId = 'notification123';
      const userEmail = 'user@example.com';
      const mockNotification = {
        _id: notificationId,
        receiverEmail: 'other@example.com' // Different user
      };

      mockNotificationRepository.updateById.mockResolvedValue(mockNotification);

      await expect(notificationService.acceptNotification(notificationId, userEmail))
        .rejects.toThrow('Failed to accept notification: Notification not found or access denied');
    });
  });

  describe('confirmLab', () => {
    it('should confirm lab successfully', async () => {
      const notificationId = 'notification123';
      const mockNotification = {
        _id: notificationId,
        bookingId: 'booking123'
      };

      mockNotificationRepository.findById.mockResolvedValue(mockNotification);
      mockNotificationRepository.updateByBookingId.mockResolvedValue({ modifiedCount: 3 });

      const result = await notificationService.confirmLab(notificationId);

      expect(mockNotificationRepository.findById).toHaveBeenCalledWith(notificationId);
      expect(mockNotificationRepository.updateByBookingId).toHaveBeenCalledWith('booking123', {
        IsLabWillGoingOn: true,
        type: 'confirmed',
        isRead: false
      });
      expect(result.updatedCount).toBe(3);
    });

    it('should throw error when notification not found', async () => {
      const notificationId = 'notification123';

      mockNotificationRepository.findById.mockResolvedValue(null);

      await expect(notificationService.confirmLab(notificationId))
        .rejects.toThrow('Failed to confirm lab: Notification not found');
    });
  });

  describe('cancelLab', () => {
    it('should cancel lab successfully', async () => {
      const notificationId = 'notification123';
      const mockNotification = {
        _id: notificationId,
        bookingId: 'booking123'
      };

      mockNotificationRepository.findById.mockResolvedValue(mockNotification);
      mockNotificationRepository.updateByBookingId.mockResolvedValue({ modifiedCount: 2 });

      const result = await notificationService.cancelLab(notificationId);

      expect(mockNotificationRepository.updateByBookingId).toHaveBeenCalledWith('booking123', {
        IsLabWillGoingOn: false,
        type: 'cancellation',
        isRead: false
      });
      expect(result.updatedCount).toBe(2);
    });
  });

  describe('updateNotificationsToReminder', () => {
    it('should update notifications to reminder type', async () => {
      const date = new Date('2024-01-15');
      mockNotificationRepository.updateNotificationsByDate.mockResolvedValue({ modifiedCount: 5 });

      const result = await notificationService.updateNotificationsToReminder(date);

      expect(mockNotificationRepository.updateNotificationsByDate).toHaveBeenCalledWith(
        date.toISOString(),
        { type: 'reminder' }
      );
      expect(result.updatedCount).toBe(5);
    });
  });

  describe('generateEmailContent', () => {
    it('should generate correct email content for request type', () => {
      const notification = {
        type: 'request',
        labSessionTitle: 'Test Lab',
        labDate: '2024-01-15',
        labStartTime: '10:00',
        labEndTime: '12:00',
        senderEmail: 'sender@example.com',
        message: 'Test message'
      };

      const result = notificationService.generateEmailContent(notification);

      expect(result.subject).toContain('Lab Booking REQUEST');
      expect(result.html).toContain('Lab Booking Request');
      expect(result.html).toContain('Test Lab');
      expect(result.html).toContain('2024-01-15');
      expect(result.html).toContain('sender@example.com');
    });

    it('should generate correct email content for reminder type', () => {
      const notification = {
        type: 'reminder',
        labSessionTitle: 'Test Lab',
        labDate: '2024-01-15',
        labStartTime: '10:00',
        labEndTime: '12:00'
      };

      const result = notificationService.generateEmailContent(notification);

      expect(result.subject).toContain('Tomorrow');
      expect(result.html).toContain('Lab Session Reminder');
      expect(result.html).toContain('tomorrow');
    });
  });
});