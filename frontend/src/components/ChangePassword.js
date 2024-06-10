import React, { useState } from 'react';
import './ChangePassword.css';
import authService from '../services/authService';

const ChangePassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleGetCode = async () => {
    try {
      await authService.sendOtp(email);
      setOtpSent(true);
      alert('OTP sent to your email');
    } catch (error) {
      console.error(error);
      alert('Error sending OTP');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await authService.changePassword(email, otp, newPassword);
      alert('Password changed successfully');
    } catch (error) {
      console.error(error);
      alert('Error changing password');
    }
  };

  return (
    <div className="change-password-container">
      <div className='change-password-left-container'></div>
      <div className='change-password-right-container'>
        <h2 className='title-change-pass'>Change Password</h2>
        <div className="input-group">
          <label>Enter your email address below to get the code to your inbox</label>
          <div className="email-input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button onClick={handleGetCode} disabled={otpSent}>Get code</button>
          </div>
        </div>
        <div className="input-group">
          <label>New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={!otpSent}
          />
        </div>
        <div className="input-group">
          <label>Confirm password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={!otpSent}
          />
        </div>
        <div className="input-group">
          <label>OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            disabled={!otpSent}
          />
        </div>
        <button onClick={handleChangePassword} disabled={!otpSent}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
