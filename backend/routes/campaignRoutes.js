const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Campaign = require('../models/Campaign');

// @route   GET /api/campaigns
// @desc    Get all campaigns (for the logged-in user or all if admin)
// @access  Private (Admin, Marketing Manager, Super Admin)
router.get('/', [auth, authorize(['Super Admin', 'Admin', 'Marketing Manager'])], async (req, res) => {
  try {
    // For now, let's fetch all campaigns, but ideally filter by user or role
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/campaigns
// @desc    Create a campaign
// @access  Private (Admin, Marketing Manager, Super Admin)
router.post('/', [auth, authorize(['Super Admin', 'Admin', 'Marketing Manager'])], async (req, res) => {
  try {
    const { title, description, notes, type, status, budget, startDate, endDate, objective, attachments, audience } = req.body;

    const newCampaign = new Campaign({
      title,
      description,
      notes,
      type,
      status,
      budget,
      startDate,
      endDate,
      objective,
      attachments,
      audience,
      createdBy: req.user.id
    });

    const campaign = await newCampaign.save();
    res.json(campaign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/campaigns/:id
// @desc    Update a campaign
// @access  Private (Admin, Marketing Manager, Super Admin)
router.put('/:id', [auth, authorize(['Super Admin', 'Admin', 'Marketing Manager'])], async (req, res) => {
  try {
    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    // Optional: Check user authorization here (e.g., only creator or admin can edit)

    campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after' }
    );

    res.json(campaign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/campaigns/:id
// @desc    Delete a campaign
// @access  Private (Admin, Super Admin)
router.delete('/:id', [auth, authorize(['Super Admin', 'Admin'])], async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    res.json({ msg: 'Campaign removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
