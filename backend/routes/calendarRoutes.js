const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const Campaign = require('../models/Campaign');
const SocialPost = require('../models/SocialPost');

// @route   GET /api/calendar
// @desc    Get universal calendar events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const calendarEvents = [];

    // 1. Fetch Tasks, Meetings, Events
    const tasks = await Task.find().populate('assignedTo', 'name');
    tasks.forEach(t => {
      calendarEvents.push({
        id: `task_${t._id}`,
        title: t.title,
        start: t.dueDate || t.createdAt,
        end: t.dueDate || t.createdAt,
        type: t.eventType || 'Task', // 'Task', 'Meeting', 'Event'
        resource: t
      });
    });

    // 2. Fetch Lead Follow-ups
    const leads = await Lead.find({ followUpDate: { $ne: null } });
    leads.forEach(l => {
      calendarEvents.push({
        id: `lead_${l._id}`,
        title: `Follow up: ${l.name}`,
        start: l.followUpDate,
        end: l.followUpDate,
        type: 'Follow-up',
        resource: l
      });
    });

    // 3. Fetch Campaigns
    const campaigns = await Campaign.find({ startDate: { $ne: null } });
    campaigns.forEach(c => {
      calendarEvents.push({
        id: `campaign_${c._id}`,
        title: `Campaign: ${c.title}`,
        start: c.startDate,
        end: c.endDate || c.startDate,
        type: 'Campaign',
        resource: c
      });
    });

    // 4. Fetch Social Posts
    const socialPosts = await SocialPost.find({ scheduledFor: { $ne: null } });
    socialPosts.forEach(sp => {
      calendarEvents.push({
        id: `social_${sp._id}`,
        title: `Social Post (${sp.platforms.join(', ')})`,
        start: sp.scheduledFor,
        end: sp.scheduledFor,
        type: 'Social Post',
        resource: sp
      });
    });

    res.json(calendarEvents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
