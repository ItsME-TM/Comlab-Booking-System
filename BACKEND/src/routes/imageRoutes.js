const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const Image = require('../models/Image');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get image by user ID endpoint
router.get('/get/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Received request for image with user ID: ${userId}`);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid or missing user ID');
    }

    // Find the image by user ID
    const image = await Image.findOne({ userId: userId }).exec();

    if (!image) {
      console.error('Image not found');
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', image.img.contentType);
    res.send(image.img.data);
  } catch (err) {
    console.error(`Error finding image: ${err}`);
    return res.status(500).send(err);
  }
});

router.post('/edit', upload.single('image'), async (req, res) => {
  try {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId } = req.body;
    const img = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };

    const updatedImage = await Image.findOneAndUpdate(
      { userId },
      { $set: { img }, $setOnInsert: { userId } }, // Ensure userId is set on insert
      { new: true, upsert: true },
    );

    res
      .status(200)
      .json({ msg: 'Image updated or created successfully', updatedImage });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
