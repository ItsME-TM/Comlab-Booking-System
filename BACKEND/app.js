const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRouter'); 
const bookingRoutes = require('./routes/bookingRoutes');
const notificationRouter = require('./routes/notificationRouter');

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/bookings', bookingRoutes);
app.use('/api/notification', notificationRouter);
module.exports = app;
