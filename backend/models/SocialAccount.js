const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['Facebook', 'Instagram', 'LinkedIn', 'X', 'YouTube'],
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  isConnected: {
    type: Boolean,
    default: true // Mocked to true for demo
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SocialAccount', socialAccountSchema);
