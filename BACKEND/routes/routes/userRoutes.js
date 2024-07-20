const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); 
const crypto = require('crypto');
const { setTimeout } = require('timers/promises');
require('dotenv').config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send OTP
const sendMails = (email, otp) => {
  const mailOptions = {
    from: {
      name: 'Admin',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: "Your OTP Code for password change!",
    text: `Your OTP code is ${otp}`,
  };
  return transporter.sendMail(mailOptions);
};

//function to send user details 
const sendMailNewUser = (firstName, lastName, email, role, password) => {
  const subject = "Welcome to Our Platform!";
  const text = `
Dear ${firstName} ${lastName},

Welcome to our platform! Your account has been successfully created.

Here are your account details:
Email: ${email}
Role: ${role}
Password: ${password}

Thank you and have a great day!

Best regards,
Email Sender
`;

  const mailOptions2 = {
    from: {
      name: 'Email Sender',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions2);
};

const sendDeleteNotification = (firstName, lastName, email) => {
  const subject = "Account Deletion Notification";
  const text = `
Dear ${firstName} ${lastName},

We regret to inform you that your account has been deleted from our platform.

If you believe this deletion was in error or have any questions, please contact our support team.

Best regards,
Email Sender
`;

  const mailOptions = {
    from: {
      name: 'Email Sender',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions);
};

const sendEditNotification = (firstName, lastName, email, role) => {
  const subject = "Account Details Updated";
  const text = `
Dear ${firstName} ${lastName},

Your account details have been updated on our platform.

Here are your updated account details:
Email: ${email}
Role: ${role}

If you did not request this change or have any questions, please contact our support team immediately.

Best regards,
Email Sender
`;

  const mailOptions = {
    from: {
      name: 'Email Sender',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions);
};

// Endpoint to verify email and send OTP
router.get('/verify-email', async (req, res) => {
  try {
    const { email } = req.query; // Using query parameter for email in GET request
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    console.log("genarated otp:", otp);
    user.otp = otp;
    console.log("user otp:", user.otp);
    await user.save();

    setTimeout(async () => {
      user.otp = ''; 
      await user.save();
      console.log(`OTP removed for ${email} after 5 minutes.`);
    }, 5 * 60 * 1000);

    await sendMails(email, otp);
    res.json({ message: 'Email found', otp ,email});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new user
router.post('/add', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. You're not an admin." });
    }
    const { firstName, lastName, email, role, password } = req.body;
    const user = new User({ firstName, lastName, email, role, password });
    await user.save();
    await sendMailNewUser(firstName, lastName, email, role, password);
    res.json({ message: 'User added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


//Get all users 
router.get('/getall', auth, async(req, res) => {
  console.log('hit getall');
  try{
    if(req.user.role !== 'admin'){
      return res.status(403).json({error: "Access denied. You're not an admin."});
    }
    const getUsers = await User.find({role:{$ne: 'admin'}});
    res.json(getUsers);
  }
  catch(error){
    console.error(error);
    res.status(500).json({error: 'Server error'});
  }
});

//Get names and emails
router.get('/getNames', auth, async(req, res) => {
  try{
    if(req.user.role !== 'lecturer' && req.user.role !== 'instructor'){
      return res.status(403).json({error: "Access denied. You're not an admin."});
    }
    const getUsers = await User.find({role:{$ne: 'admin'}});
    res.json(getUsers);
  }
  catch(error){
    console.error(error);
    res.status(500).json({error: 'Server error'});
  }
});

//Get all the lectures
router.get('/lecturers', auth, async(req, res) =>{
  try{
    if(req.user.role !== 'admin'){
      return res.status(403).json({error: "Access denied. You're not an admin."});
    }
    const lectures = await User.find({role:'lecturer'});
    res.json(lectures);
  }
  catch(error){
    console.error(error);
    res.status(500).json({error: 'Server error'});
  }
});

//Get all tos
router.get('/tos', auth, async(req, res) =>{
  try{
    if(req.user.role !== 'admin'){
      return res.status(403).json({error: "Access denied. You're not an admin."});
    }
    const tos = await User.find({role:'to'});
    res.json(tos);
  }
  catch(error){
    console.error(error);
    res.status(500).json({error: 'Server error'});
  }
});

//Get all instructors
router.get('/instructors', auth, async(req, res) =>{
  try{
    if(req.user.role !== 'admin'){
      return res.status(403).json({error: "Access denied. You're not an admin."});
    }
    const instructors = await User.find({role:'instructor'});
    res.json(instructors);
  }
  catch(error){
    console.error(error);
    res.status(500).json({error: 'Server error'});
  }
});

router.get('/tokenUser', auth, async(req, res) =>{
  try{
    const tokenUser = await User.findById(req.user._id).select('-password');
    res.json(tokenUser);
    console.log("Token api details:", tokenUser);
  }catch(error){
    console.error(error);
    res.status(500).json({error: 'Server error'});
  }
});

// Get user by ID 
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. You're not an admin." });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


//Delete the user by id
router.delete('/:id', auth, async(req, res) => {
  try{
    if(req.user.role !== 'admin'){
      return res.status(403).json({error: "Access denied. You're not an admin."});
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({error: "User not found"});
    await sendDeleteNotification(user.firstName, user.lastName, user.email);
    console.log("User deleted successfully: " + user);
    res.json({message: "User deleted successfully"});
  }catch(error){
    console.error(error);
    res.status(500).json({error: 'Server error'});
  }
});

//Update the user by id
router.put('/:id', auth, async(req, res) => {
  try{
    if(req.user.role !== 'admin'){
      return res.status(403).json({error: "Access denied. You're not an admin."});
    }

    const {firstName, lastName, email, role, password} = req.body;
    if(role && !['admin', 'lecturer', 'instructor', 'to'].includes(role)){
      return res.status(400).json({error: "Role must be either admin, lecturer, instructor or to"});
    }

    const updateUser = {firstName, lastName, email, role};
    if(password){
      updateUser.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateUser, {new:true});
    if (!user) return res.status(404).json({ error: 'User not found' });
    await sendEditNotification(user.firstName, user.lastName, user.email, user.role);
    res.json({ message: 'User updated successfully', updateUser });
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user password by email
router.post('/update-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
