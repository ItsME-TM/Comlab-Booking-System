import axios from 'axios';

const sendOtp = (email) => {
  return axios.post('/api/auth/send-otp', { email });
};

const changePassword = (email, otp, newPassword) => {
  return axios.post('/api/auth/change-password', { email, otp, newPassword });
};

export default {
  sendOtp,
  changePassword,
};
