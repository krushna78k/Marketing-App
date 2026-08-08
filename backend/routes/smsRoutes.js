const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { auth, authorize } = require('../middleware/auth');
const SmsTemplate = require('../models/SmsTemplate');
const SmsCampaign = require('../models/SmsCampaign');
const SmsLog = require('../models/SmsLog');
const Lead = require('../models/Lead');
const twilio = require('twilio');

// --- TEMPLATE ROUTES ---

// @route   GET /api/sms/templates
// @desc    Get all SMS templates
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await SmsTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/sms/templates
// @desc    Create an SMS template
router.post('/templates', auth, async (req, res) => {
  try {
    const { name, content } = req.body;
    const newTemplate = new SmsTemplate({
      name, content, createdBy: req.user.id
    });
    const template = await newTemplate.save();
    res.json(template);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- DISPATCH ROUTE (SIMULATED) ---

// @route   POST /api/sms/dispatch
// @desc    Simulate bulk sending an SMS campaign
router.post('/dispatch', auth, async (req, res) => {
  try {
    const { title, templateId, scheduledFor } = req.body;
    
    // 1. Create the SmsCampaign record
    const smsCampaign = new SmsCampaign({
      title,
      template: templateId,
      status: scheduledFor ? 'Scheduled' : 'Completed', // Simulating instant completion if no schedule
      scheduledFor,
      createdBy: req.user.id
    });
    await smsCampaign.save();

    // If scheduled, we would normally use a chron job. For simulation, if it's not scheduled, we send now.
    if (!scheduledFor) {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        return res.status(500).json({ msg: 'Twilio credentials not configured in .env' });
      }
      
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      const template = await SmsTemplate.findById(templateId);

      // 2. Fetch Leads (simulating audience segmentation by just fetching all leads for demo)
      const leads = await Lead.find();
      
      let sentCount = 0;
      let failedCount = 0;
      
      // 3. Generate tracking logs and send SMS for each lead
      for (const lead of leads) {
        if (!lead.phone) continue; // Must have a phone number for SMS
        
        const trackingId = crypto.randomBytes(16).toString('hex');
        let status = 'Failed';
        
        try {
          // Personalization injection
          const personalizedContent = template.content.replace(/{{name}}/g, lead.name || 'Customer');
          
          await client.messages.create({
            body: personalizedContent,
            from: twilioPhone,
            to: lead.phone
          });
          
          status = 'Sent';
          sentCount++;
        } catch (smsErr) {
          console.error(`Failed to send SMS to ${lead.phone}:`, smsErr.message);
          failedCount++;
        }
        
        const log = new SmsLog({
          smsCampaign: smsCampaign._id,
          recipientPhone: lead.phone,
          recipientId: lead._id,
          status,
          trackingId
        });
        
        await log.save();
      }
      
      // Update stats
      smsCampaign.stats.sent = sentCount;
      smsCampaign.stats.failed = failedCount;
      smsCampaign.stats.delivered = sentCount; 
      await smsCampaign.save();
    }

    res.json(smsCampaign);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- DELIVERY WEBHOOK ROUTE (MOCKED) ---

// @route   POST /api/sms/webhook/:trackingId
// @desc    Mock webhook for SMS delivery reports (usually called by Twilio/SNS)
// @access  Public (No Auth required!)
router.post('/webhook/:trackingId', async (req, res) => {
  try {
    const { status } = req.body; // e.g. 'Delivered', 'Failed'
    
    const log = await SmsLog.findOne({ trackingId: req.params.trackingId });
    if (log && log.status !== status) {
      log.status = status;
      if (status === 'Delivered') log.deliveredAt = Date.now();
      await log.save();
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
