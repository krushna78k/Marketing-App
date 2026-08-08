const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String // Optional image/video URL
  },
  platforms: [{
    type: String,
    enum: ['Facebook', 'Instagram', 'LinkedIn', 'X', 'YouTube']
  }],
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Published', 'Failed'],
    default: 'Draft'
  },
  scheduledFor: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SocialPost', socialPostSchema);
