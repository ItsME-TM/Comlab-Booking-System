const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Add a new user
router.post('/add', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. You're not an admin." });
    }
    const { firstName, lastName, email, role, password } = req.body;
    const user = new User({ firstName, lastName, email, role, password });
    await user.save();
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
    res.json({ message: 'User updated successfully', updateUser });
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
