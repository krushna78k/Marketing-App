const mongoose = require('mongoose');

const fileAssetSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('FileAsset', fileAssetSchema);
