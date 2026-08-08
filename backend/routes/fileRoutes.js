const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, authorize } = require('../middleware/auth');
const fs = require('fs');
const FileAsset = require('../models/FileAsset');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// @route   GET /api/files
// @desc    Get all files
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const files = await FileAsset.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/files/upload
// @desc    Upload a file (image, document, etc.)
// @access  Private (Admin, Marketing Manager, Super Admin)
router.post('/upload', [auth, authorize(['Super Admin', 'Admin', 'Marketing Manager'])], upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    
    // Return the URL path to access the file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // Save to database
    const newFileAsset = new FileAsset({
      originalName: req.file.originalname,
      fileName: req.file.filename,
      url: fileUrl,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id
    });
    
    const savedFile = await newFileAsset.save();

    res.json(savedFile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete a file
// @access  Private (Admin, Marketing Manager, Super Admin)
router.delete('/:id', [auth, authorize(['Super Admin', 'Admin', 'Marketing Manager'])], async (req, res) => {
  try {
    const fileAsset = await FileAsset.findById(req.params.id);
    if (!fileAsset) {
      return res.status(404).json({ msg: 'File not found' });
    }

    // Unlink (delete) from filesystem
    const filePath = path.join(__dirname, '..', 'uploads', fileAsset.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await FileAsset.findByIdAndDelete(req.params.id);

    res.json({ msg: 'File deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
