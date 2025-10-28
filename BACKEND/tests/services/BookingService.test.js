const BookingService = require('../../src/services/BookingService');
const BookingRepository = require('../../src/repositories/BookingRepository');

// Mock dependencies
jest.mock('../../src/repositories/BookingRepository');

describe('BookingService', () => {
  let bookingService;
  let mockBookingRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    bookingService = new BookingService();
    mockBookingRepository = bookingService.bookingRepository;
  });

  describe('validateBookingData', () => {
    it('should return no errors for valid booking data', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const endDate = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      const bookingData = {
        title: 'Lab Session',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        description: 'Test lab session',
        attendees: ['student1@example.com', 'student2@example.com'],
        status: 'pending',
      };

      const errors = bookingService.validateBookingData(bookingData);
      expect(errors).toEqual([]);
    });

    it('should return errors for invalid booking data', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const bookingData = {
        title: '',
        startTime: pastDate.toISOString(),
        endTime: pastDate.toISOString(),
        attendees: ['invalid-email'],
        status: 'invalid-status',
      };

      const errors = bookingService.validateBookingData(bookingData);
      expect(errors).toContain('Title is required');
      expect(errors).toContain('End time must be after start time');
      expect(errors).toContain('Start time cannot be in the past');
      expect(errors).toContain(
        'Invalid email format for attendee 1: invalid-email',
      );
      expect(errors).toContain(
        'Invalid status. Must be one of: pending, confirmed, cancelled',
      );
    });

    it('should validate booking duration limits', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Test too long duration (over 8 hours)
      const longEndDate = new Date(futureDate.getTime() + 9 * 60 * 60 * 1000);
      const longBooking = {
        title: 'Long Session',
        startTime: futureDate.toISOString(),
        endTime: longEndDate.toISOString(),
      };

      let errors = bookingService.validateBookingData(longBooking);
      expect(errors).toContain('Booking duration cannot exceed 8 hours');

      // Test too short duration (under 30 minutes)
      const shortEndDate = new Date(futureDate.getTime() + 15 * 60 * 1000);
      const shortBooking = {
        title: 'Short Session',
        startTime: futureDate.toISOString(),
        endTime: shortEndDate.toISOString(),
      };

      errors = bookingService.validateBookingData(shortBooking);
      expect(errors).toContain('Booking duration must be at least 30 minutes');
    });

    it('should require at least one attendee', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000);

      const bookingData = {
        title: 'Lab Session',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        attendees: [],
      };

      const errors = bookingService.validateBookingData(bookingData);
      expect(errors).toContain('At least one attendee is required');
    });
  });

  describe('createBooking', () => {
    it('should successfully create a booking with valid data', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000);

      const bookingData = {
        title: 'Lab Session',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        description: 'Test session',
        attendees: ['student@example.com'],
      };

      const mockCreatedBooking = {
        _id: 'booking123',
        ...bookingData,
        status: 'pending',
      };

      mockBookingRepository.findOverlappingBookings.mockResolvedValue([]);
      mockBookingRepository.create.mockResolvedValue(mockCreatedBooking);

      const result = await bookingService.createBooking(bookingData);

      expect(mockBookingRepository.findOverlappingBookings).toHaveBeenCalled();
      expect(mockBookingRepository.create).toHaveBeenCalledWith({
        ...bookingData,
        status: 'pending',
      });
      expect(result).toEqual(mockCreatedBooking);
    });

    it('should throw error for invalid booking data', async () => {
      const bookingData = {
        title: '',
        startTime: 'invalid-date',
      };

      await expect(bookingService.createBooking(bookingData)).rejects.toThrow(
        'Validation failed',
      );
    });

    it('should throw error when time slot is not available', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000);

      const bookingData = {
        title: 'Lab Session',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        attendees: ['student@example.com'],
      };

      const conflictingBooking = {
        _id: 'existing123',
        title: 'Existing Session',
        status: 'confirmed',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      mockBookingRepository.findOverlappingBookings.mockResolvedValue([
        conflictingBooking,
      ]);

      await expect(bookingService.createBooking(bookingData)).rejects.toThrow(
        'Time slot is not available',
      );
    });

    it('should filter out empty attendees', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000);

      const bookingData = {
        title: 'Lab Session',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
        attendees: ['student@example.com', '', '  ', 'student2@example.com'],
      };

      mockBookingRepository.findOverlappingBookings.mockResolvedValue([]);
      mockBookingRepository.create.mockResolvedValue({ _id: 'booking123' });

      await bookingService.createBooking(bookingData);

      expect(mockBookingRepository.create).toHaveBeenCalledWith({
        ...bookingData,
        attendees: ['student@example.com', 'student2@example.com'],
        status: 'pending',
      });
    });
  });

  describe('checkAvailability', () => {
    it('should return available for valid time slot', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000);

      mockBookingRepository.findOverlappingBookings.mockResolvedValue([]);

      const result = await bookingService.checkAvailability(
        futureDate.toISOString(),
        endDate.toISOString(),
      );

      expect(result.available).toBe(true);
      expect(result.reason).toBe('Time slot is available');
    });

    it('should return not available for conflicting bookings', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000);

      const conflictingBooking = {
        _id: 'existing123',
        title: 'Existing Session',
        status: 'confirmed',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      mockBookingRepository.findOverlappingBookings.mockResolvedValue([
        conflictingBooking,
      ]);

      const result = await bookingService.checkAvailability(
        futureDate.toISOString(),
        endDate.toISOString(),
      );

      expect(result.available).toBe(false);
      expect(result.reason).toBe('Time slot conflicts with existing bookings');
      expect(result.conflicts).toHaveLength(1);
    });

    it('should ignore cancelled bookings when checking availability', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000);

      const cancelledBooking = {
        _id: 'cancelled123',
        title: 'Cancelled Session',
        status: 'cancelled',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      mockBookingRepository.findOverlappingBookings.mockResolvedValue([
        cancelledBooking,
      ]);

      const result = await bookingService.checkAvailability(
        futureDate.toISOString(),
        endDate.toISOString(),
      );

      expect(result.available).toBe(true);
    });

    it('should exclude current booking when updating', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000);

      const currentBooking = {
        _id: 'current123',
        title: 'Current Session',
        status: 'confirmed',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      mockBookingRepository.findOverlappingBookings.mockResolvedValue([
        currentBooking,
      ]);

      const result = await bookingService.checkAvailability(
        futureDate.toISOString(),
        endDate.toISOString(),
        'current123',
      );

      expect(result.available).toBe(true);
    });

    it('should return error for invalid parameters', async () => {
      let result = await bookingService.checkAvailability('', '');
      expect(result.available).toBe(false);
      expect(result.reason).toBe('Start time and end time are required');

      result = await bookingService.checkAvailability(
        'invalid-date',
        'invalid-date',
      );
      expect(result.available).toBe(false);
      expect(result.reason).toBe('Invalid date format');

      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      result = await bookingService.checkAvailability(
        futureDate.toISOString(),
        futureDate.toISOString(),
      );
      expect(result.available).toBe(false);
      expect(result.reason).toBe('End time must be after start time');

      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      result = await bookingService.checkAvailability(
        pastDate.toISOString(),
        futureDate.toISOString(),
      );
      expect(result.available).toBe(false);
      expect(result.reason).toBe('Start time cannot be in the past');
    });
  });

  describe('updateBooking', () => {
    it('should successfully update booking with valid data', async () => {
      const existingBooking = {
        _id: 'booking123',
        title: 'Old Title',
        status: 'pending',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      };

      const updateData = {
        title: 'New Title',
        description: 'Updated description',
      };
      const updatedBooking = { ...existingBooking, ...updateData };

      mockBookingRepository.findById.mockResolvedValue(existingBooking);
      mockBookingRepository.update.mockResolvedValue(updatedBooking);

      const result = await bookingService.updateBooking(
        'booking123',
        updateData,
      );

      expect(mockBookingRepository.findById).toHaveBeenCalledWith('booking123');
      expect(mockBookingRepository.update).toHaveBeenCalledWith(
        'booking123',
        updateData,
      );
      expect(result).toEqual(updatedBooking);
    });

    it('should check availability when updating time', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const newEndDate = new Date(futureDate.getTime() + 3 * 60 * 60 * 1000);

      const existingBooking = {
        _id: 'booking123',
        status: 'pending',
        startTime: futureDate.toISOString(),
        endTime: new Date(
          futureDate.getTime() + 2 * 60 * 60 * 1000,
        ).toISOString(),
      };

      const updateData = { endTime: newEndDate.toISOString() };

      mockBookingRepository.findById.mockResolvedValue(existingBooking);
      mockBookingRepository.findOverlappingBookings.mockResolvedValue([]);
      mockBookingRepository.update.mockResolvedValue({
        ...existingBooking,
        ...updateData,
      });

      await bookingService.updateBooking('booking123', updateData);

      expect(mockBookingRepository.findOverlappingBookings).toHaveBeenCalled();
    });

    it('should throw error when booking not found', async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(
        bookingService.updateBooking('booking123', { title: 'New Title' }),
      ).rejects.toThrow('Booking not found');
    });

    it('should throw error when trying to update cancelled booking', async () => {
      const cancelledBooking = {
        _id: 'booking123',
        status: 'cancelled',
      };

      mockBookingRepository.findById.mockResolvedValue(cancelledBooking);

      await expect(
        bookingService.updateBooking('booking123', { title: 'New Title' }),
      ).rejects.toThrow('Cannot update a cancelled booking');
    });

    it('should filter out empty attendees', async () => {
      const existingBooking = {
        _id: 'booking123',
        status: 'pending',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      };

      const updateData = {
        attendees: ['student@example.com', '', '  ', 'student2@example.com'],
      };

      mockBookingRepository.findById.mockResolvedValue(existingBooking);
      mockBookingRepository.update.mockResolvedValue(existingBooking);

      await bookingService.updateBooking('booking123', updateData);

      expect(mockBookingRepository.update).toHaveBeenCalledWith('booking123', {
        attendees: ['student@example.com', 'student2@example.com'],
      });
    });
  });

  describe('cancelBooking', () => {
    it('should successfully cancel booking', async () => {
      const booking = {
        _id: 'booking123',
        status: 'pending',
      };

      const cancelledBooking = { ...booking, status: 'cancelled' };

      mockBookingRepository.findById.mockResolvedValue(booking);
      mockBookingRepository.updateStatus.mockResolvedValue(cancelledBooking);

      const result = await bookingService.cancelBooking('booking123');

      expect(mockBookingRepository.findById).toHaveBeenCalledWith('booking123');
      expect(mockBookingRepository.updateStatus).toHaveBeenCalledWith(
        'booking123',
        'cancelled',
      );
      expect(result).toEqual(cancelledBooking);
    });

    it('should throw error when booking not found', async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(bookingService.cancelBooking('booking123')).rejects.toThrow(
        'Booking not found',
      );
    });

    it('should throw error when booking is already cancelled', async () => {
      const booking = {
        _id: 'booking123',
        status: 'cancelled',
      };

      mockBookingRepository.findById.mockResolvedValue(booking);

      await expect(bookingService.cancelBooking('booking123')).rejects.toThrow(
        'Booking is already cancelled',
      );
    });
  });

  describe('confirmBooking', () => {
    it('should successfully confirm booking', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const endDate = new Date(futureDate.getTime() + 2 * 60 * 60 * 1000);

      const booking = {
        _id: 'booking123',
        status: 'pending',
        startTime: futureDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      const confirmedBooking = { ...booking, status: 'confirmed' };

      mockBookingRepository.findById.mockResolvedValue(booking);
      mockBookingRepository.findOverlappingBookings.mockResolvedValue([
        booking,
      ]);
      mockBookingRepository.updateStatus.mockResolvedValue(confirmedBooking);

      const result = await bookingService.confirmBooking('booking123');

      expect(mockBookingRepository.updateStatus).toHaveBeenCalledWith(
        'booking123',
        'confirmed',
      );
      expect(result).toEqual(confirmedBooking);
    });

    it('should throw error when booking not found', async () => {
      mockBookingRepository.findById.mockResolvedValue(null);

      await expect(bookingService.confirmBooking('booking123')).rejects.toThrow(
        'Booking not found',
      );
    });

    it('should throw error when booking is cancelled', async () => {
      const booking = {
        _id: 'booking123',
        status: 'cancelled',
      };

      mockBookingRepository.findById.mockResolvedValue(booking);

      await expect(bookingService.confirmBooking('booking123')).rejects.toThrow(
        'Cannot confirm a cancelled booking',
      );
    });

    it('should throw error when booking is already confirmed', async () => {
      const booking = {
        _id: 'booking123',
        status: 'confirmed',
      };

      mockBookingRepository.findById.mockResolvedValue(booking);

      await expect(bookingService.confirmBooking('booking123')).rejects.toThrow(
        'Booking is already confirmed',
      );
    });
  });

  describe('getBookingsByStatus', () => {
    it('should return bookings with specified status', async () => {
      const mockBookings = [
        { _id: 'booking1', status: 'pending' },
        { _id: 'booking2', status: 'pending' },
      ];

      mockBookingRepository.findByStatus.mockResolvedValue(mockBookings);

      const result = await bookingService.getBookingsByStatus('pending');

      expect(mockBookingRepository.findByStatus).toHaveBeenCalledWith(
        'pending',
      );
      expect(result).toEqual(mockBookings);
    });

    it('should throw error for invalid status', async () => {
      await expect(
        bookingService.getBookingsByStatus('invalid-status'),
      ).rejects.toThrow('Invalid status specified');
    });
  });

  describe('getBookingsByDateRange', () => {
    it('should return bookings within date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockBookings = [{ _id: 'booking1' }];

      mockBookingRepository.findByDateRange.mockResolvedValue(mockBookings);

      const result = await bookingService.getBookingsByDateRange(
        startDate,
        endDate,
      );

      expect(mockBookingRepository.findByDateRange).toHaveBeenCalledWith(
        startDate,
        endDate,
      );
      expect(result).toEqual(mockBookings);
    });

    it('should throw error for invalid date range', async () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01');

      await expect(
        bookingService.getBookingsByDateRange(startDate, endDate),
      ).rejects.toThrow('End date must be after start date');
    });

    it('should throw error for missing dates', async () => {
      await expect(
        bookingService.getBookingsByDateRange(null, new Date()),
      ).rejects.toThrow('Start date and end date are required');
    });
  });

  describe('getBookingStats', () => {
    it('should return booking statistics', async () => {
      mockBookingRepository.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // pending
        .mockResolvedValueOnce(5) // confirmed
        .mockResolvedValueOnce(2); // cancelled

      const result = await bookingService.getBookingStats();

      expect(result).toEqual({
        total: 10,
        pending: 3,
        confirmed: 5,
        cancelled: 2,
      });
    });
  });

  describe('validation helpers', () => {
    it('should validate status correctly', () => {
      expect(bookingService.isValidStatus('pending')).toBe(true);
      expect(bookingService.isValidStatus('confirmed')).toBe(true);
      expect(bookingService.isValidStatus('cancelled')).toBe(true);
      expect(bookingService.isValidStatus('invalid')).toBe(false);
    });
  });
});
