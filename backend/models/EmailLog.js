const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  emailCampaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign',
    required: true
  },
  recipientEmail: {
    type: String,
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead' // Could be Contact later, assuming Lead for now
  },
  status: {
    type: String,
    enum: ['Sending', 'Sent', 'Failed', 'Delivered', 'Opened', 'Clicked', 'Bounced', 'Unsubscribed'],
    default: 'Sent'
  },
  openedAt: Date,
  clickedAt: Date,
  trackingId: {
    type: String,
    required: true,
    unique: true // Used for 1x1 pixel tracking
  }
}, { timestamps: true });

module.exports = mongoose.model('EmailLog', emailLogSchema);
