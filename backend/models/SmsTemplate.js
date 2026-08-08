const mongoose = require('mongoose');

const smsTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  content: {
    type: String, // Plain text for SMS
    required: true,
    maxlength: 160 // Standard SMS length limit, though multipart is possible
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SmsTemplate', smsTemplateSchema);
