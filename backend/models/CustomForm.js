const mongoose = require('mongoose');

const customFormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Lead Form', 'Newsletter Form', 'Registration Form', 'Feedback Form'],
    default: 'Lead Form'
  },
  fields: [{
    id: String,
    type: { type: String }, // text, email, phone, checkbox, textarea
    label: String,
    required: { type: Boolean, default: false }
  }],
  settings: {
    enableCaptcha: { type: Boolean, default: false },
    emailNotifications: { type: String }, // Comma separated emails
    webhookUrl: { type: String }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CustomForm', customFormSchema);
