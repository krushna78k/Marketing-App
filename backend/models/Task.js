const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  eventType: {
    type: String,
    enum: ['Task', 'Meeting', 'Event'],
    default: 'Task'
  },
  relatedToType: {
    type: String,
    enum: ['Campaign', 'Lead', 'Deal', 'General'],
    default: 'General'
  },
  relatedToId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedToType'
  },
  comments: [{
    text: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    date: { type: Date, default: Date.now }
  }],
  attachments: [{
    url: String,
    name: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
