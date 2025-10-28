const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  // Create an in-memory MongoDB instance
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017, // Use default port for consistency
      dbName: 'lab_booking_test',
    },
  });

  const uri = mongod.getUri();
  
  // Store the instance and URI globally for use in tests
  global.__MONGOD__ = mongod;
  process.env.MONGODB_URL = uri;
  
  console.log(`MongoDB Memory Server started at: ${uri}`);
};