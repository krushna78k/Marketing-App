const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema({
  smsCampaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmsCampaign',
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
    enum: ['Sent', 'Delivered', 'Failed'],
    default: 'Sent'
  },
  deliveredAt: Date,
  trackingId: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SmsLog', smsLogSchema);
