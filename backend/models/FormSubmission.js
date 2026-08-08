const mongoose = require('mongoose');

const formSubmissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomForm',
    required: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);
