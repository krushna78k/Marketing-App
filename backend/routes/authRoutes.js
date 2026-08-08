const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Register
router.post('/register', async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    email = email.trim();
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    await user.save();

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
      const message = `Please verify your email by clicking on the following link: \n\n ${verificationUrl}`;
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message
      });
    } catch (err) {
      console.error('Email could not be sent', err);
      // Proceed without failing registration
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    let { email, password, role } = req.body;
    email = email.trim();

    // See if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    if (role && user.role !== role) {
      return res.status(400).json({ msg: 'Invalid Role for this user' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get logged in user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const emailVerificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ emailVerificationToken });
    
    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ msg: 'Email verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/auth/me
// @desc    Update logged in user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const { name } = req.body;
    let updateFields = {};
    if (name) updateFields.name = name;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { returnDocument: 'after' }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request a password reset link
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.trim() });
    if (!user) {
      return res.status(404).json({ msg: 'There is no user with that email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you requested a password reset. Please click on the following link or make a POST request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message
      });
      res.json({ msg: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ msg: 'Email could not be sent' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.json({ msg: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
