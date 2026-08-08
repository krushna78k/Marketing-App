const mongoose = require('mongoose');

const pageAnalyticsSchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LandingPage',
    required: true
  },
  metrics: {
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    formSubmissions: { type: Number, default: 0 }
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('PageAnalytics', pageAnalyticsSchema);
