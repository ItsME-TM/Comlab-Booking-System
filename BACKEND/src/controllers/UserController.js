const UserService = require('../services/UserService');
const nodemailer = require('nodemailer');
require('dotenv').config();

class UserController {
  constructor() {
    this.userService = new UserService();
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Email notification methods
  async sendNewUserEmail(firstName, lastName, email, role, password) {
    const subject = 'Welcome to Our Platform!';
    const text = `
Dear ${firstName} ${lastName},

Welcome to our platform! Your account has been successfully created.

Here are your account details:
Email: ${email}
Role: ${role}
Password: ${password}

Thank you and have a great day!

Best regards,
LBS Administrator
`;

    const mailOptions = {
      from: {
        name: 'LBS Administrator',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: subject,
      text: text,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendDeleteNotification(firstName, lastName, email) {
    const subject = 'Account Deletion Notification';
    const text = `
Dear ${firstName} ${lastName},

We regret to inform you that your account has been deleted from our platform.

If you believe this deletion was in error or have any questions, please contact our support team.

Best regards,
LBS Administrator
`;

    const mailOptions = {
      from: {
        name: 'LBS Administrator',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: subject,
      text: text,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendEditNotification(firstName, lastName, email, role) {
    const subject = 'Account Details Updated';
    const text = `
Dear ${firstName} ${lastName},

Your account details have been updated on our platform.

Here are your updated account details:
Email: ${email}
Role: ${role}

If you did not request this change or have any questions, please contact our support team immediately.

Best regards,
LBS Administrator
`;

    const mailOptions = {
      from: {
        name: 'LBS Administrator',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: subject,
      text: text,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordChangeNotification(firstName, lastName, email, role) {
    const subject = 'Your Password Has Been Successfully Changed';
    const text = `
Dear ${firstName} ${lastName},

We wanted to let you know that your password has been successfully changed.

Here are your updated account details:
Email: ${email}
Role: ${role}

For your security, please ensure that you never share your password with anyone. If you have any concerns or questions, please feel free to reach out to our support team.

If you did not request this change or have any questions, please contact our support team immediately.
Thank you for using our service.

Best regards,
LBS Administrator
`;

    const mailOptions = {
      from: {
        name: 'LBS Administrator',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: subject,
      text: text,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendOtpEmail(email, otp) {
    const mailOptions = {
      from: {
        name: 'LBS Administrator',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: 'Your OTP Code for password change!',
      text: `Your OTP code is ${otp}`,
    };
    return this.transporter.sendMail(mailOptions);
  }

  // Controller methods
  async verifyEmail(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const { otp, user } = await this.userService.generateAndSaveOtp(email);
      await this.sendOtpEmail(email, otp);

      console.log('Generated OTP:', otp);
      res.json({ message: 'Email found', otp, email });
    } catch (error) {
      console.error('Verify email error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'Email not found' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  async addUser(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. You're not an admin." });
      }

      const { firstName, lastName, email, role, password } = req.body;
      const user = await this.userService.createUser({ firstName, lastName, email, role, password });
      
      await this.sendNewUserEmail(firstName, lastName, email, role, password);
      res.json({ message: 'User added successfully' });
    } catch (error) {
      console.error('Add user error:', error);
      if (error.message.includes('Validation failed') || error.message.includes('already exists')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getAllUsers(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. You're not an admin." });
      }

      const users = await this.userService.getAllUsers(false);
      res.json(users);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getUserNames(req, res) {
    try {
      if (req.user.role !== 'lecturer' && req.user.role !== 'instructor') {
        return res.status(403).json({ error: 'Access denied. You are not authorized.' });
      }

      const users = await this.userService.getAllUsers(false);
      res.json(users);
    } catch (error) {
      console.error('Get user names error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getLecturers(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. You're not an admin." });
      }

      const lecturers = await this.userService.getLecturers();
      res.json(lecturers);
    } catch (error) {
      console.error('Get lecturers error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getTechnicalOfficers(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. You're not an admin." });
      }

      const tos = await this.userService.getTechnicalOfficers();
      res.json(tos);
    } catch (error) {
      console.error('Get technical officers error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getInstructors(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. You're not an admin." });
      }

      const instructors = await this.userService.getInstructors();
      res.json(instructors);
    } catch (error) {
      console.error('Get instructors error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getTokenUser(req, res) {
    try {
      const user = await this.userService.getUserById(req.user._id);
      res.json(user);
      console.log('Token user details:', user);
    } catch (error) {
      console.error('Get token user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getUserById(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. You're not an admin." });
      }

      const user = await this.userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      console.error('Get user by ID error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  async getUserDetails(req, res) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      console.error('Get user details error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  async deleteUser(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. You're not an admin." });
      }

      // Get user details before deletion for email notification
      const user = await this.userService.getUserById(req.params.id);
      await this.userService.deleteUser(req.params.id);
      
      await this.sendDeleteNotification(user.firstName, user.lastName, user.email);
      console.log('User deleted successfully:', user);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  async updateUser(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. You're not an admin." });
      }

      const { firstName, lastName, email, role, password } = req.body;
      const updateData = { firstName, lastName, email, role };
      
      if (password) {
        updateData.password = password;
      }

      const user = await this.userService.updateUser(req.params.id, updateData);
      await this.sendEditNotification(user.firstName, user.lastName, user.email, user.role);
      
      res.json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error('Update user error:', error);
      if (error.message.includes('Validation failed') || 
          error.message.includes('User not found') || 
          error.message.includes('Email already exists')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  async updateUserName(req, res) {
    try {
      const { firstName, lastName } = req.body;
      
      // Get original user details for email notification
      const originalUser = await this.userService.getUserById(req.params.id);
      const user = await this.userService.updateUserName(req.params.id, firstName, lastName);
      
      await this.sendEditNotification(originalUser.firstName, originalUser.lastName, originalUser.email, originalUser.role);
      res.json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error('Update user name error:', error);
      if (error.message.includes('required') || error.message === 'User not found') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }

  async updatePassword(req, res) {
    try {
      const { email, password } = req.body;
      
      const user = await this.userService.updatePassword(email, password);
      await this.sendPasswordChangeNotification(user.firstName, user.lastName, user.email, user.role);
      
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Update password error:', error);
      if (error.message.includes('required') || 
          error.message === 'User not found' || 
          error.message.includes('Password must be')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = UserController;