const BookingRepository = require('../../src/repositories/BookingRepository');
const Booking = require('../../src/models/labBooking');

// Mock the Booking model
jest.mock('../../src/models/labBooking');

describe('BookingRepository', () => {
  let bookingRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingRepository = new BookingRepository();
  });

  describe('create', () => {
    it('should create and save a new booking', async () => {
      const bookingData = {
        title: 'Lab Session',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T12:00:00Z',
        description: 'Test session'
      };

      const mockSave = jest.fn().mockResolvedValue({ _id: 'booking123', ...bookingData });
      Booking.mockImplementation(() => ({
        save: mockSave,
        ...bookingData
      }));

      const result = await bookingRepository.create(bookingData);

      expect(Booking).toHaveBeenCalledWith(bookingData);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({ _id: 'booking123', ...bookingData });
    });
  });

  describe('findById', () => {
    it('should find booking by ID', async () => {
      const mockBooking = { _id: 'booking123', title: 'Lab Session' };
      Booking.findById.mockResolvedValue(mockBooking);

      const result = await bookingRepository.findById('booking123');

      expect(Booking.findById).toHaveBeenCalledWith('booking123');
      expect(result).toEqual(mockBooking);
    });
  });

  describe('findAll', () => {
    it('should find all bookings with filters', async () => {
      const mockBookings = [
        { _id: 'booking1', status: 'pending' },
        { _id: 'booking2', status: 'confirmed' }
      ];
      const filters = { status: 'pending' };

      Booking.find.mockResolvedValue(mockBookings);

      const result = await bookingRepository.findAll(filters);

      expect(Booking.find).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockBookings);
    });

    it('should find all bookings without filters', async () => {
      const mockBookings = [{ _id: 'booking1' }];
      Booking.find.mockResolvedValue(mockBookings);

      const result = await bookingRepository.findAll();

      expect(Booking.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockBookings);
    });
  });

  describe('findActiveBookings', () => {
    it('should find all non-cancelled bookings', async () => {
      const mockBookings = [
        { _id: 'booking1', status: 'pending' },
        { _id: 'booking2', status: 'confirmed' }
      ];

      Booking.find.mockResolvedValue(mockBookings);

      const result = await bookingRepository.findActiveBookings();

      expect(Booking.find).toHaveBeenCalledWith({ status: { $ne: 'cancelled' } });
      expect(result).toEqual(mockBookings);
    });
  });

  describe('findOverlappingBookings', () => {
    it('should find overlapping bookings with default exclusions', async () => {
      const startTime = '2024-01-01T10:00:00Z';
      const endTime = '2024-01-01T12:00:00Z';
      const mockBookings = [{ _id: 'booking1', status: 'confirmed' }];

      Booking.find.mockResolvedValue(mockBookings);

      const result = await bookingRepository.findOverlappingBookings(startTime, endTime);

      expect(Booking.find).toHaveBeenCalledWith({
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ],
        status: { $nin: ['cancelled'] }
      });
      expect(result).toEqual(mockBookings);
    });

    it('should find overlapping bookings with custom exclusions', async () => {
      const startTime = '2024-01-01T10:00:00Z';
      const endTime = '2024-01-01T12:00:00Z';
      const excludeStatuses = ['cancelled', 'pending'];
      const mockBookings = [{ _id: 'booking1', status: 'confirmed' }];

      Booking.find.mockResolvedValue(mockBookings);

      const result = await bookingRepository.findOverlappingBookings(
        startTime, 
        endTime, 
        excludeStatuses
      );

      expect(Booking.find).toHaveBeenCalledWith({
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ],
        status: { $nin: excludeStatuses }
      });
      expect(result).toEqual(mockBookings);
    });
  });

  describe('findByDateRange', () => {
    it('should find bookings within date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockBookings = [{ _id: 'booking1' }];

      Booking.find.mockResolvedValue(mockBookings);

      const result = await bookingRepository.findByDateRange(startDate, endDate);

      expect(Booking.find).toHaveBeenCalledWith({
        startTime: { $gte: startDate },
        endTime: { $lte: endDate }
      });
      expect(result).toEqual(mockBookings);
    });
  });

  describe('findByStatus', () => {
    it('should find bookings by status', async () => {
      const status = 'pending';
      const mockBookings = [{ _id: 'booking1', status: 'pending' }];

      Booking.find.mockResolvedValue(mockBookings);

      const result = await bookingRepository.findByStatus(status);

      expect(Booking.find).toHaveBeenCalledWith({ status });
      expect(result).toEqual(mockBookings);
    });
  });

  describe('update', () => {
    it('should update booking and return updated document', async () => {
      const id = 'booking123';
      const updateData = { title: 'Updated Title' };
      const updatedBooking = { _id: id, ...updateData };

      Booking.findByIdAndUpdate.mockResolvedValue(updatedBooking);

      const result = await bookingRepository.update(id, updateData);

      expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(id, updateData, { new: true });
      expect(result).toEqual(updatedBooking);
    });
  });

  describe('updateStatus', () => {
    it('should update booking status', async () => {
      const id = 'booking123';
      const status = 'confirmed';
      const updatedBooking = { _id: id, status };

      Booking.findByIdAndUpdate.mockResolvedValue(updatedBooking);

      const result = await bookingRepository.updateStatus(id, status);

      expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(id, { status }, { new: true });
      expect(result).toEqual(updatedBooking);
    });
  });

  describe('delete', () => {
    it('should delete booking by ID', async () => {
      const id = 'booking123';
      const deletedBooking = { _id: id, title: 'Deleted Booking' };

      Booking.findByIdAndDelete.mockResolvedValue(deletedBooking);

      const result = await bookingRepository.delete(id);

      expect(Booking.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(deletedBooking);
    });
  });

  describe('count', () => {
    it('should count bookings with filters', async () => {
      const filters = { status: 'pending' };
      Booking.countDocuments.mockResolvedValue(5);

      const result = await bookingRepository.count(filters);

      expect(Booking.countDocuments).toHaveBeenCalledWith(filters);
      expect(result).toBe(5);
    });

    it('should count all bookings without filters', async () => {
      Booking.countDocuments.mockResolvedValue(10);

      const result = await bookingRepository.count();

      expect(Booking.countDocuments).toHaveBeenCalledWith({});
      expect(result).toBe(10);
    });
  });

  describe('exists', () => {
    it('should return true if booking exists', async () => {
      const id = 'booking123';
      Booking.findById.mockResolvedValue({ _id: id });

      const result = await bookingRepository.exists(id);

      expect(Booking.findById).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it('should return false if booking does not exist', async () => {
      const id = 'booking123';
      Booking.findById.mockResolvedValue(null);

      const result = await bookingRepository.exists(id);

      expect(Booking.findById).toHaveBeenCalledWith(id);
      expect(result).toBe(false);
    });
  });
});