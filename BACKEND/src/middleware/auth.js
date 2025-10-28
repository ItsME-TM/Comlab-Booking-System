const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optionally verify user still exists
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not found.',
      });
    }

    req.user = decoded;
    req.userDetails = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Role-based Access Control Middleware
 * Restricts access based on user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

/**
 * Request Validation Middleware
 * Validates request body against required fields
 */
const validateRequest = requiredFields => {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Email Validation Middleware
 */
const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }
  }

  next();
};

/**
 * Password Strength Validation Middleware
 */
const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (password) {
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }
  }

  next();
};

module.exports = {
  auth,
  authorize,
  validateRequest,
  validateEmail,
  validatePassword,
};
