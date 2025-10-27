const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid email or password' });
  console.log("Invalid email or password ");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ message: 'Invalid email or password' });
  console.log("Invalid email or password");

  const token = jwt.sign({ _id: user._id, role: user.role, email:user.email }, process.env.JWT_SECRET, { expiresIn: '3d' });
  res.json({
    token,
    user: {
      role: user.role,
      email: user.email
    }
  });
  console.log("Valid", user);
});

module.exports = router;
