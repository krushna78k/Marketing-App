const mongoose = require('mongoose');

const whatsappCampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppTemplate',
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
    ref: 'Campaign' // Linking back to the main Campaign audience criteria if needed
  },
  stats: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 }, // Double grey tick
    read: { type: Number, default: 0 },      // Double blue tick
    failed: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('WhatsAppCampaign', whatsappCampaignSchema);
