const app = require('./src/app');
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const config = require('./src/config');
const logger = require('./src/config/logger');

const path = require('path');

// CORS configuration
app.use(
  cors({
    origin: config.isProduction
      ? config.frontend.url
      : config.security.corsOrigin,
    credentials: true,
  }),
);

// Serve static files in production
if (config.isProduction) {
  app.use(express.static(config.frontend.buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(config.frontend.buildPath, 'index.html'));
  });
}

// Database connection with error handling
const connectDB = async () => {
  try {
    await mongoose.connect(config.database.url, config.database.options);
    logger.info('MongoDB connection established successfully', {
      database: config.database.url.split('@')[1]?.split('/')[0] || 'local',
      environment: config.app.env,
    });
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected');
});

mongoose.connection.on('error', err => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Graceful shutdown...');
  await mongoose.connection.close();
  logger.info('MongoDB connection closed.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM. Graceful shutdown...');
  await mongoose.connection.close();
  logger.info('MongoDB connection closed.');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.app.port, config.app.host, () => {
      logger.info(`${config.app.name} v${config.app.version} started`, {
        port: config.app.port,
        host: config.app.host,
        environment: config.app.env,
        nodeVersion: process.version,
        pid: process.pid,
      });
    });

    // Handle server errors
    server.on('error', err => {
      logger.error('Server error:', err);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
