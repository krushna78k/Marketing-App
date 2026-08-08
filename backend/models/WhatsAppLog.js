const mongoose = require('mongoose');

const whatsappLogSchema = new mongoose.Schema({
  whatsappCampaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WhatsAppCampaign',
    required: true
  },
  recipientPhone: {
    type: String,
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  status: {
    type: String,
    enum: ['Sent', 'Delivered', 'Read', 'Failed'],
    default: 'Sent'
  },
  deliveredAt: Date,
  readAt: Date,
  trackingId: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('WhatsAppLog', whatsappLogSchema);
