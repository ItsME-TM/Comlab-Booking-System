const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
    console.log('no token provided');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
    console.log('no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('token authenticated', decoded); 
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Failed to authenticate token' });
    console.log('failed to authenticate token');
  }
};

module.exports = auth;
