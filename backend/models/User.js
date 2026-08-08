const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Super Admin', 'Admin', 'Marketing Manager', 'Sales Executive', 'Viewer'],
    default: 'Viewer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
