const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  stage: {
    type: String,
    enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'Prospecting'
  },
  expectedCloseDate: {
    type: Date
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
