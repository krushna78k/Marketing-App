const mongoose = require('mongoose');

const socialAnalyticsSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialPost',
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  metrics: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('SocialAnalytics', socialAnalyticsSchema);
