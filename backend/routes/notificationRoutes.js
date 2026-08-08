const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET /api/notifications
// @desc    Get all notifications for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });
    
    // Ensure user owns this notification
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { $set: { isRead: true } });
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/notifications/simulate
// @desc    Simulate dispatching a multi-channel alert
// @access  Private
router.post('/simulate', auth, async (req, res) => {
  try {
    const { title, message, channels, link } = req.body;
    
    // This logs the notification to the DB.
    // In a real app, you would also trigger SendGrid/Twilio/FCM APIs here based on the channels array.
    const newAlert = new Notification({
      title,
      message,
      channels: channels || ['In-App'],
      link,
      user: req.user.id
    });
    
    await newAlert.save();
    res.json({ msg: 'Alert Dispatched Successfully', notification: newAlert });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
