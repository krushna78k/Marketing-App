const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Deal = require('../models/Deal');

// @route   GET /api/deals
router.get('/', auth, async (req, res) => {
  try {
    const deals = await Deal.find().populate('leadId', 'name company').populate('assignedTo', 'name');
    res.json(deals);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/deals
router.post('/', auth, async (req, res) => {
  try {
    const newDeal = new Deal({
      ...req.body,
      assignedTo: req.user.id
    });
    const deal = await newDeal.save();
    if (deal.leadId) await deal.populate('leadId', 'name company');
    res.json(deal);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/deals/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after' }
    ).populate('leadId', 'name company');
    res.json(deal);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/deals/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Deal.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Deal removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
