const NotificationRepository = require('../../src/repositories/NotificationRepository');
const Notification = require('../../src/models/notification');

// Mock the Notification model
jest.mock('../../src/models/notification');

describe('NotificationRepository', () => {
  let notificationRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationRepository = new NotificationRepository();
  });

  describe('create', () => {
    it('should create a new notification', async () => {
      const notificationData = {
        receiverEmail: 'user@example.com',
        bookingId: 'booking123',
        type: 'request',
      };

      const mockNotification = {
        _id: 'notification123',
        ...notificationData,
        save: jest.fn().mockResolvedValue(true),
      };

      Notification.mockImplementation(() => mockNotification);

      const result = await notificationRepository.create(notificationData);

      expect(Notification).toHaveBeenCalledWith(notificationData);
      expect(mockNotification.save).toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findById', () => {
    it('should find notification by id', async () => {
      const notificationId = 'notification123';
      const mockNotification = { _id: notificationId, type: 'request' };

      Notification.findById.mockResolvedValue(mockNotification);

      const result = await notificationRepository.findById(notificationId);

      expect(Notification.findById).toHaveBeenCalledWith(notificationId);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findByReceiver', () => {
    it('should find notifications by receiver email', async () => {
      const receiverEmail = 'user@example.com';
      const mockNotifications = [
        { _id: 'notification1', receiverEmail, type: 'request' },
        { _id: 'notification2', receiverEmail, type: 'confirmed' },
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockNotifications),
      };
      Notification.find.mockReturnValue(mockQuery);

      const result = await notificationRepository.findByReceiver(receiverEmail);

      expect(Notification.find).toHaveBeenCalledWith({ receiverEmail });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockNotifications);
    });

    it('should find notifications by receiver email with filters', async () => {
      const receiverEmail = 'user@example.com';
      const filters = { type: { $ne: 'booking_confirmation' } };
      const expectedQuery = { receiverEmail, ...filters };

      const mockQuery = {
        sort: jest.fn().mockResolvedValue([]),
      };
      Notification.find.mockReturnValue(mockQuery);

      await notificationRepository.findByReceiver(receiverEmail, filters);

      expect(Notification.find).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('findBySender', () => {
    it('should find notifications by sender email', async () => {
      const senderEmail = 'sender@example.com';
      const mockNotifications = [
        { _id: 'notification1', senderEmail, type: 'booking_confirmation' },
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockNotifications),
      };
      Notification.find.mockReturnValue(mockQuery);

      const result = await notificationRepository.findBySender(senderEmail);

      expect(Notification.find).toHaveBeenCalledWith({ senderEmail });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('findByBookingId', () => {
    it('should find notifications by booking id', async () => {
      const bookingId = 'booking123';
      const mockNotifications = [
        { _id: 'notification1', bookingId, type: 'request' },
        { _id: 'notification2', bookingId, type: 'confirmed' },
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockNotifications),
      };
      Notification.find.mockReturnValue(mockQuery);

      const result = await notificationRepository.findByBookingId(bookingId);

      expect(Notification.find).toHaveBeenCalledWith({ bookingId });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('updateById', () => {
    it('should update notification by id', async () => {
      const notificationId = 'notification123';
      const updateData = { isRead: true };
      const mockUpdatedNotification = { _id: notificationId, isRead: true };

      Notification.findByIdAndUpdate.mockResolvedValue(mockUpdatedNotification);

      const result = await notificationRepository.updateById(
        notificationId,
        updateData,
      );

      expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(
        notificationId,
        updateData,
        { new: true },
      );
      expect(result).toEqual(mockUpdatedNotification);
    });
  });

  describe('updateByBookingId', () => {
    it('should update multiple notifications by booking id', async () => {
      const bookingId = 'booking123';
      const updateData = { type: 'confirmed' };
      const mockResult = { modifiedCount: 3 };

      Notification.updateMany.mockResolvedValue(mockResult);

      const result = await notificationRepository.updateByBookingId(
        bookingId,
        updateData,
      );

      expect(Notification.updateMany).toHaveBeenCalledWith(
        { bookingId },
        updateData,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read for authorized user', async () => {
      const notificationId = 'notification123';
      const userEmail = 'user@example.com';
      const mockNotification = { _id: notificationId, isRead: true };

      Notification.findOneAndUpdate.mockResolvedValue(mockNotification);

      const result = await notificationRepository.markAsRead(
        notificationId,
        userEmail,
      );

      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: notificationId,
          $or: [{ receiverEmail: userEmail }, { senderEmail: userEmail }],
        },
        { isRead: true },
        { new: true },
      );
      expect(result).toEqual(mockNotification);
    });
  });

  describe('updateNotificationsByDate', () => {
    it('should update notifications by date', async () => {
      const date = '2024-01-15T00:00:00.000Z';
      const updateData = { type: 'reminder' };
      const mockResult = { modifiedCount: 5 };

      Notification.updateMany.mockResolvedValue(mockResult);

      const result = await notificationRepository.updateNotificationsByDate(
        date,
        updateData,
      );

      expect(Notification.updateMany).toHaveBeenCalledWith(
        { labDate: date, type: { $ne: 'cancellation' } },
        updateData,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteById', () => {
    it('should delete notification by id', async () => {
      const notificationId = 'notification123';
      const mockDeletedNotification = { _id: notificationId };

      Notification.findByIdAndDelete.mockResolvedValue(mockDeletedNotification);

      const result = await notificationRepository.deleteById(notificationId);

      expect(Notification.findByIdAndDelete).toHaveBeenCalledWith(
        notificationId,
      );
      expect(result).toEqual(mockDeletedNotification);
    });
  });

  describe('findAll', () => {
    it('should find all notifications', async () => {
      const mockNotifications = [
        { _id: 'notification1', type: 'request' },
        { _id: 'notification2', type: 'confirmed' },
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockNotifications),
      };
      Notification.find.mockReturnValue(mockQuery);

      const result = await notificationRepository.findAll();

      expect(Notification.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockNotifications);
    });

    it('should find all notifications with filters', async () => {
      const filters = { type: 'request' };
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([]),
      };
      Notification.find.mockReturnValue(mockQuery);

      await notificationRepository.findAll(filters);

      expect(Notification.find).toHaveBeenCalledWith(filters);
    });
  });
});
