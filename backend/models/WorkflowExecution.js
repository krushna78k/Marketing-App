const mongoose = require('mongoose');

const workflowExecutionSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Failed'],
    default: 'In Progress'
  },
  currentStepIndex: {
    type: Number,
    default: 0
  },
  logs: [{
    actionType: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('WorkflowExecution', workflowExecutionSchema);
