const mongoose = require('mongoose');

/**
 * Database test helper utilities
 */
class DbHelper {
  /**
   * Create test data for a model
   * @param {mongoose.Model} Model - Mongoose model
   * @param {Object} data - Data to create
   * @returns {Promise<Object>} Created document
   */
  static async createTestData(Model, data) {
    const document = new Model(data);
    return await document.save();
  }

  /**
   * Create multiple test documents
   * @param {mongoose.Model} Model - Mongoose model
   * @param {Array} dataArray - Array of data objects
   * @returns {Promise<Array>} Array of created documents
   */
  static async createMultipleTestData(Model, dataArray) {
    return await Model.insertMany(dataArray);
  }

  /**
   * Clear all data from a collection
   * @param {mongoose.Model} Model - Mongoose model
   */
  static async clearCollection(Model) {
    await Model.deleteMany({});
  }

  /**
   * Clear all collections in the database
   */
  static async clearAllCollections() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }

  /**
   * Get collection statistics
   * @param {mongoose.Model} Model - Mongoose model
   * @returns {Promise<Object>} Collection stats
   */
  static async getCollectionStats(Model) {
    const count = await Model.countDocuments();
    return { count };
  }

  /**
   * Check if database is connected
   * @returns {boolean} Connection status
   */
  static isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = DbHelper;
