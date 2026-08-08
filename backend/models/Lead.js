const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  company: {
    type: String
  },
  designation: {
    type: String
  },
  industry: {
    type: String
  },
  source: {
    type: String,
    default: 'Manual Entry'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'],
    default: 'New'
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  followUpDate: {
    type: Date
  },
  notes: {
    type: String
  },
  customerNotes: [{
    content: String,
    date: { type: Date, default: Date.now }
  }],
  activityTimeline: [{
    action: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
