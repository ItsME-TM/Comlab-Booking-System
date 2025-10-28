const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');

// Initialize controller
const userController = new UserController();

// Endpoint to verify email and send OTP
router.get('/verify-email', async (req, res) => {
  await userController.verifyEmail(req, res);
});

// Add a new user
router.post('/add', auth, async (req, res) => {
  await userController.addUser(req, res);
});

// Get all users
router.get('/getall', auth, async (req, res) => {
  await userController.getAllUsers(req, res);
});

// Get names and emails
router.get('/getNames', auth, async (req, res) => {
  await userController.getUserNames(req, res);
});

// Get all the lecturers
router.get('/lecturers', auth, async (req, res) => {
  await userController.getLecturers(req, res);
});

// Get all tos
router.get('/tos', auth, async (req, res) => {
  await userController.getTechnicalOfficers(req, res);
});

// Get all instructors
router.get('/instructors', auth, async (req, res) => {
  await userController.getInstructors(req, res);
});

// Get token user
router.get('/tokenUser', auth, async (req, res) => {
  await userController.getTokenUser(req, res);
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  await userController.getUserById(req, res);
});

// Delete the user by id
router.delete('/:id', auth, async (req, res) => {
  await userController.deleteUser(req, res);
});

// Update the user by id
router.put('/:id', auth, async (req, res) => {
  await userController.updateUser(req, res);
});

// Update user password by email
router.post('/update-password', async (req, res) => {
  await userController.updatePassword(req, res);
});

// Get user details by ID
router.get('/getDetails/:id', auth, async (req, res) => {
  await userController.getUserDetails(req, res);
});

// Update user name by id
router.post('/updateName/:id', auth, async (req, res) => {
  await userController.updateUserName(req, res);
});

module.exports = router;
