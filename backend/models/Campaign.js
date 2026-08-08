const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  notes: {
    type: String
  },
  type: {
    type: String,
    enum: ['Email', 'SMS', 'WhatsApp', 'Facebook', 'Instagram', 'LinkedIn', 'Google Ads', 'Offline'],
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Paused', 'Completed'],
    default: 'Draft'
  },
  budget: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  objective: {
    type: String,
    enum: ['Lead Generation', 'Brand Awareness', 'Sales', 'Traffic'],
    default: 'Lead Generation'
  },
  attachments: [{
    fileName: String,
    fileUrl: String
  }],
  audience: {
    location: [String],
    ageRange: String,
    gender: String,
    customerType: [String],
    purchaseHistory: String,
    campaignEngagement: String,
    interests: [String],
    tags: [String],
    customFilters: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
