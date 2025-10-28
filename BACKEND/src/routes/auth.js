const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const User = require('../models/user');

// Authenticate user
router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    const token = jwt.sign({ user: req.user }, config.jwtSecret, {
      expiresIn: '3d',
    });
    res.json({
      token,
      user: {
        role: req.user.role,
      },
    });
  },
);

module.exports = router;
