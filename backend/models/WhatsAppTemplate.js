const mongoose = require('mongoose');

const whatsappTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  content: {
    type: String, // Plain text supporting formatting like *bold* _italic_
    required: true
  },
  mediaUrl: {
    type: String // Optional URL for image, video, or document
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('WhatsAppTemplate', whatsappTemplateSchema);
