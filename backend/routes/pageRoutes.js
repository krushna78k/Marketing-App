const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const LandingPage = require('../models/LandingPage');
const PageAnalytics = require('../models/PageAnalytics');
const Lead = require('../models/Lead'); // For form integrations

// --- PAGE BUILDER ROUTES ---

// @route   GET /api/pages
// @desc    Get all landing pages
router.get('/', auth, async (req, res) => {
  try {
    const pages = await LandingPage.find().sort({ createdAt: -1 });
    res.json(pages);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/pages
// @desc    Create or Update a landing page
router.post('/', auth, async (req, res) => {
  try {
    const { pageId, title, blocks, seo, domain, status } = req.body;
    
    let page;
    if (pageId) {
      page = await LandingPage.findById(pageId);
      if (!page) return res.status(404).json({ msg: 'Page not found' });
      
      page.title = title;
      page.blocks = blocks;
      page.seo = seo;
      page.domain = domain;
      
      if (status === 'Published' && page.status !== 'Published') {
        page.publishedAt = Date.now();
      }
      page.status = status;
      
      await page.save();
    } else {
      page = new LandingPage({
        title, blocks, seo, domain, status, createdBy: req.user.id
      });
      if (status === 'Published') page.publishedAt = Date.now();
      await page.save();

      // Initialize analytics
      const analytics = new PageAnalytics({ pageId: page._id });
      await analytics.save();
    }

    res.json(page);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Domain already in use.' });
    }
    res.status(500).send('Server Error');
  }
});

// --- ANALYTICS ROUTES ---

// @route   GET /api/pages/:id/analytics
// @desc    Get analytics for a specific landing page
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const analytics = await PageAnalytics.findOne({ pageId: req.params.id });
    if (!analytics) return res.json({ views: 0, uniqueVisitors: 0, formSubmissions: 0 });
    res.json(analytics.metrics);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- PUBLIC INTEGRATION ROUTES ---

// @route   POST /api/pages/public/submit
// @desc    Handle form submission from a published landing page (Public Route)
router.post('/public/submit', async (req, res) => {
  try {
    const { pageId, name, email, phone } = req.body;
    
    // 1. Create a Lead
    const newLead = new Lead({
      name: name || 'Unknown',
      email: email,
      phone: phone,
      source: 'Landing Page Form',
      status: 'New'
    });
    // Bypassing assignedTo for public submission, logic can be added later
    await newLead.save();

    // 2. Track Conversion
    if (pageId) {
      const analytics = await PageAnalytics.findOne({ pageId });
      if (analytics) {
        analytics.metrics.formSubmissions += 1;
        await analytics.save();
      }
    }

    res.status(200).json({ msg: 'Submission successful' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/pages/public/track
// @desc    Track page view (Public Route)
router.post('/public/track', async (req, res) => {
  try {
    const { pageId, isUnique } = req.body;
    if (pageId) {
      const analytics = await PageAnalytics.findOne({ pageId });
      if (analytics) {
        analytics.metrics.views += 1;
        if (isUnique) analytics.metrics.uniqueVisitors += 1;
        await analytics.save();
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
