// tests/server.test.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('../app');  

jest.mock('mongoose');
jest.mock('dotenv');
jest.mock('../app');

describe('Server Tests', () => {
  beforeAll(() => {
    dotenv.config.mockImplementation(() => ({
      parsed: {
        PORT: 8070,
        MONGODB_URL: 'mongodb://localhost:27017/testdb'
      }
    }));
    
    mongoose.connect.mockImplementation(() => Promise.resolve());
    mongoose.connection = {
      once: jest.fn((event, callback) => {
        if (event === 'open') {
          callback();
        }
      })
    };
  });

  test('should start the server and log the port', () => {
    const logSpy = jest.spyOn(console, 'log');
    const listenMock = jest.fn((port, callback) => callback());
    app.listen.mockImplementation(listenMock);

    require('../server');  
    expect(logSpy).toHaveBeenCalledWith('Server is up and running on port 8070');
  });

  test('should log MongoDB connection success', () => {
    const logSpy = jest.spyOn(console, 'log');
    require('../server');  
    expect(logSpy).toHaveBeenCalledWith('MongoDB connection success!');
  });

 
});
