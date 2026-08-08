const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  blocks: [{
    id: String,
    type: { type: String }, // e.g., 'hero', 'features', 'form'
    content: mongoose.Schema.Types.Mixed
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: String
  },
  domain: {
    type: String, // Custom domain support
    unique: true,
    sparse: true // Allows nulls to not conflict on uniqueness
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
  },
  publishedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('LandingPage', landingPageSchema);
