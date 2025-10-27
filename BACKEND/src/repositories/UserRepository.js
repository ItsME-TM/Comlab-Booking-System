const User = require('../models/user');

class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id) {
    return await User.findById(id).select('-password');
  }

  async findByIdWithPassword(id) {
    return await User.findById(id);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findAll(filters = {}) {
    return await User.find(filters).select('-password');
  }

  async findByRole(role) {
    return await User.find({ role }).select('-password');
  }

  async findNonAdminUsers() {
    return await User.find({ role: { $ne: 'admin' } }).select('-password');
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  }

  async updateByEmail(email, updateData) {
    return await User.findOneAndUpdate({ email }, updateData, { new: true }).select('-password');
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  async updateOtp(email, otp) {
    return await User.findOneAndUpdate({ email }, { otp }, { new: true });
  }

  async clearOtp(email) {
    return await User.findOneAndUpdate({ email }, { otp: '' }, { new: true });
  }

  async exists(email) {
    const user = await User.findOne({ email });
    return !!user;
  }

  async count(filters = {}) {
    return await User.countDocuments(filters);
  }
}

module.exports = UserRepository;