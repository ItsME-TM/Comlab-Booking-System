const express = require('express');
const logger = require('./config/logger');
const {
  globalErrorHandler,
  notFoundHandler,
  requestLogger,
} = require('./middleware/errorHandler');

const app = express();

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRouter');
const bookingRoutes = require('./routes/bookingRoutes');
const notificationRouter = require('./routes/notificationRouter');
const imageRoutes = require('./routes/imageRoutes');

// Request logging middleware
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log application startup
logger.info('Application middleware initialized');

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notification', notificationRouter);
app.use('/api/images', imageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

module.exports = app;
