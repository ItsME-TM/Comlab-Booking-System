const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { 
  auth, 
  validateRequest, 
  validateEmail, 
  validatePassword 
} = require('../middleware/auth');

// Authentication routes with validation
router.post('/login', 
  validateRequest(['email', 'password']),
  validateEmail,
  AuthController.login
);

router.post('/register', 
  validateRequest(['firstName', 'lastName', 'email', 'password', 'role']),
  validateEmail,
  validatePassword,
  AuthController.register
);

router.post('/refresh', 
  validateRequest(['token']),
  AuthController.refreshToken
);

router.post('/logout', 
  auth, 
  AuthController.logout
);

module.exports = router;
