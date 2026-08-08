const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');

// @route   GET /api/leads
// @desc    Get all leads
// @access  Private (Admin, Marketing Manager, Sales Exec, Super Admin)
router.get('/', [auth, authorize(['Super Admin', 'Admin', 'Marketing Manager', 'Sales Executive'])], async (req, res) => {
  try {
    const leads = await Lead.find().populate('campaignId', 'title type').populate('assignedTo', 'name email').sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/leads
// @desc    Create a lead
// @access  Private (Admin, Marketing Manager, Sales Exec, Super Admin)
router.post('/', [auth, authorize(['Super Admin', 'Admin', 'Marketing Manager', 'Sales Executive'])], async (req, res) => {
  try {
    const existingLead = await Lead.findOne({ email: req.body.email });
    if (existingLead) {
      return res.status(400).json({ msg: 'A lead with this email already exists' });
    }

    const newLead = new Lead({
      ...req.body,
      assignedTo: req.body.assignedTo || req.user.id,
      activityTimeline: [{ action: 'Lead created', date: new Date() }]
    });

    const lead = await newLead.save();
    // Populate campaign details before returning if a campaign was assigned
    if (lead.campaignId) {
      await lead.populate('campaignId', 'title type');
    }
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/leads/:id
// @desc    Update a lead
// @access  Private (Admin, Marketing Manager, Sales Exec, Super Admin)
router.put('/:id', [auth, authorize(['Super Admin', 'Admin', 'Marketing Manager', 'Sales Executive'])], async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    const updates = { ...req.body };
    
    // Check if status changed
    if (updates.status && updates.status !== lead.status) {
      if (!updates.activityTimeline) updates.activityTimeline = [...lead.activityTimeline];
      updates.activityTimeline.push({
        action: `Status changed to ${updates.status}`,
        date: new Date()
      });
    }

    // Check if assignedTo changed
    if (updates.assignedTo && updates.assignedTo.toString() !== (lead.assignedTo ? lead.assignedTo.toString() : '')) {
      if (!updates.activityTimeline) updates.activityTimeline = [...lead.activityTimeline];
      updates.activityTimeline.push({
        action: `Lead reassigned`,
        date: new Date()
      });
    }

    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { returnDocument: 'after' }
    ).populate('campaignId', 'title type').populate('assignedTo', 'name email');

    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete a lead
// @access  Private (Admin, Super Admin)
router.delete('/:id', [auth, authorize(['Super Admin', 'Admin'])], async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    res.json({ msg: 'Lead removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/leads/:id/convert
// @desc    Convert Lead to Deal
// @access  Private
router.post('/:id/convert', [auth, authorize(['Super Admin', 'Admin', 'Marketing Manager', 'Sales Executive'])], async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });

    lead.status = 'Qualified';
    lead.activityTimeline.push({ action: 'Converted to Deal', date: new Date() });
    await lead.save();

    const newDeal = new Deal({
      title: `${lead.name} - Deal`,
      value: req.body.value || 0,
      stage: 'Prospecting',
      leadId: lead._id,
      assignedTo: lead.assignedTo
    });
    const savedDeal = await newDeal.save();

    res.json({ lead, deal: savedDeal });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/leads/:id/notes
// @desc    Add Customer Note
// @access  Private
router.post('/:id/notes', [auth, authorize(['Super Admin', 'Admin', 'Marketing Manager', 'Sales Executive'])], async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });

    lead.customerNotes.push({ content: req.body.content, date: new Date() });
    lead.activityTimeline.push({ action: 'Added a note', date: new Date() });
    await lead.save();

    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
