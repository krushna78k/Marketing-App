const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  channels: [{
    type: String,
    enum: ['In-App', 'Email', 'SMS', 'Push']
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  link: {
    type: String // Optional deep link to redirect on click
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
