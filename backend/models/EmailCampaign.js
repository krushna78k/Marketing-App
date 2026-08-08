const mongoose = require('mongoose');

const emailCampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate',
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Sending', 'Completed', 'Failed'],
    default: 'Draft'
  },
  scheduledFor: {
    type: Date
  },
  audienceSegment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign' // Linking back to the main Campaign audience criteria
  },
  stats: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('EmailCampaign', emailCampaignSchema);
