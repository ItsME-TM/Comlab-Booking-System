const User = require('../models/User');
const generateOtp = require('../utils/generateOtp');

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = generateOtp();
  // Save OTP to user (or email it)
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send('User not found');
  }
  user.otp = otp;
  await user.save();
  // Send OTP via email (email service code needed)
  res.send('OTP sent');
};

exports.changePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email, otp });
  if (!user) {
    return res.status(400).send('Invalid OTP or email');
  }
  user.password = newPassword;
  user.otp = null; // Clear OTP
  await user.save();
  res.send('Password changed successfully');
};
