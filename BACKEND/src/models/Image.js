const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  img: {
    data: Buffer,
    contentType: String,
  },
});

module.exports = mongoose.model('Image', ImageSchema);
