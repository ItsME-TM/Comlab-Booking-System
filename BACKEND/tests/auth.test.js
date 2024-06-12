// tests/auth.test.js
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');  

jest.mock('jsonwebtoken');

describe('Auth Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('should return 401 if no authorization header is provided', () => {
    req.header.mockReturnValue(null);
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. No token provided.' });
  });

  test('should return 401 if authorization header is provided but no token', () => {
    req.header.mockReturnValue('Bearer ');
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. No token provided.' });
  });

  test('should return 400 if token is invalid', () => {
    req.header.mockReturnValue('Bearer invalidtoken');
    jwt.verify.mockImplementation(() => { throw new Error(); });
    auth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Failed to authenticate token' });
  });

  test('should call next if token is valid', () => {
    const decoded = { id: 1, name: 'John Doe' };
    req.header.mockReturnValue('Bearer validtoken');
    jwt.verify.mockReturnValue(decoded);
    auth(req, res, next);
    expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });
});