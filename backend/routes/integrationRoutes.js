const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Integration = require('../models/Integration');

// @route   GET /api/integrations
// @desc    Get integration settings
// @access  Private/SuperAdmin
router.get('/', auth, roleAuth(['Super Admin', 'Admin']), async (req, res) => {
  try {
    let integration = await Integration.findOne();
    if (!integration) {
      // Create default if doesn't exist
      integration = new Integration();
      await integration.save();
    }
    res.json(integration);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/integrations
// @desc    Update integration settings
// @access  Private/SuperAdmin
router.post('/', auth, roleAuth(['Super Admin', 'Admin']), async (req, res) => {
  try {
    let integration = await Integration.findOne();
    if (!integration) {
      integration = new Integration();
    }

    // Merge incoming data
    const fields = ['googleAnalytics', 'googleAds', 'metaAds', 'whatsappApi', 'smtpEmail', 'paymentGateway', 'crmPlatform'];
    
    fields.forEach(field => {
      if (req.body[field]) {
        integration[field] = { ...integration[field], ...req.body[field] };
      }
    });

    integration.updatedBy = req.user.id;
    await integration.save();

    res.json({ msg: 'Integrations updated successfully', integration });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
