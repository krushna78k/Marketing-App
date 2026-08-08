const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { auth } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Helper to log activity
const logActivity = async (userId, action, details, ipAddress) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      details,
      ipAddress
    });
  } catch (err) {
    console.error('Failed to write audit log', err);
  }
};

// @route   GET /api/users/activity
// @desc    Get activity logs (Super Admin only)
// @access  Private/SuperAdmin
router.get('/activity', auth, roleAuth(['Super Admin']), async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('user', 'name email role').sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users
// @desc    Get all users (Super Admin only)
// @access  Private/SuperAdmin
router.get('/', auth, roleAuth(['Super Admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users
// @desc    Create a new user (Super Admin only)
// @access  Private/SuperAdmin
router.post('/', auth, roleAuth(['Super Admin']), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await user.save();
    
    // Log Activity
    await logActivity(req.user.id, 'Created User', { createdUser: user.email, role: user.role }, req.ip);
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/:id
// @desc    Update a user (Super Admin only)
// @access  Private/SuperAdmin
router.put('/:id', auth, roleAuth(['Super Admin']), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    let updateFields = { name, email, role };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { returnDocument: 'after' }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Log Activity
    await logActivity(req.user.id, 'Updated User', { updatedUser: user.email, role: user.role }, req.ip);

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (Super Admin only)
// @access  Private/SuperAdmin
router.delete('/:id', auth, roleAuth(['Super Admin']), async (req, res) => {
  try {
    // Prevent deleting oneself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Log Activity
    await logActivity(req.user.id, 'Deleted User', { deletedUser: user.email }, req.ip);

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
