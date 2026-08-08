const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  trigger: {
    type: String,
    enum: ['New Lead', 'Status Update', 'Form Submission', 'Manual Trigger'],
    required: true
  },
  nodes: [{
    id: String,
    type: { type: String }, // 'email', 'sms', 'whatsapp', 'delay', 'assignment'
    label: String,
    config: mongoose.Schema.Types.Mixed // Template ID, Delay duration, etc.
  }],
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Paused'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Workflow', workflowSchema);
