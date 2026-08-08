const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { auth, authorize } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const Integration = require('../models/Integration');
const EmailTemplate = require('../models/EmailTemplate');
const EmailCampaign = require('../models/EmailCampaign');
const EmailLog = require('../models/EmailLog');
const Lead = require('../models/Lead');

// --- TEMPLATE ROUTES ---

// @route   GET /api/emails/templates
// @desc    Get all email templates
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/emails/templates
// @desc    Create an email template
router.post('/templates', auth, async (req, res) => {
  try {
    const { name, subject, content, design } = req.body;
    const newTemplate = new EmailTemplate({
      name, subject, content, design, createdBy: req.user.id
    });
    const template = await newTemplate.save();
    res.json(template);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- DISPATCH ROUTE (SIMULATED) ---

// @route   POST /api/emails/dispatch
// @desc    Simulate bulk sending an email campaign
router.post('/dispatch', auth, async (req, res) => {
  try {
    const { title, templateId, scheduledFor } = req.body;
    
    // 1. Create the EmailCampaign record
    const emailCampaign = new EmailCampaign({
      title,
      template: templateId,
      status: scheduledFor ? 'Scheduled' : 'Completed', // Simulating instant completion if no schedule
      scheduledFor,
      createdBy: req.user.id
    });
    await emailCampaign.save();

    // If scheduled, we would normally use a chron job. For simulation, if it's not scheduled, we send now.
    if (!scheduledFor) {
      const template = await EmailTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({ msg: 'Template not found' });
      }

      // Fetch SMTP settings
      const integration = await Integration.findOne();
      const smtpSettings = integration?.smtpEmail || {};
      
      const host = smtpSettings.host || process.env.SMTP_HOST;
      const port = smtpSettings.port || process.env.SMTP_PORT;
      const user = smtpSettings.username || process.env.SMTP_EMAIL;
      const pass = smtpSettings.password || process.env.SMTP_PASSWORD;
      const fromEmail = user || process.env.FROM_EMAIL || 'noreply@example.com';
      const fromName = process.env.FROM_NAME || 'Admin';

      let transporter;
      try {
        transporter = nodemailer.createTransport({
          host,
          port: parseInt(port) || 587,
          auth: { user, pass }
        });
        await transporter.verify();
      } catch (err) {
        console.error('SMTP Connection Error:', err);
        return res.status(500).json({ msg: 'Failed to connect to SMTP server. Please check your Integration settings.' });
      }

      // Fetch Leads
      const leads = await Lead.find();
      let sentCount = 0;
      
      // Generate tracking logs for each lead and blast email
      for (const lead of leads) {
        if (!lead.email) continue;
        
        const trackingId = crypto.randomBytes(16).toString('hex');
        
        const log = new EmailLog({
          emailCampaign: emailCampaign._id,
          recipientEmail: lead.email,
          recipientId: lead._id,
          status: 'Sending',
          trackingId
        });
        await log.save();
        
        // Inject Tracking Pixel
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const trackingPixel = `<img src="${backendUrl}/api/emails/track/${trackingId}" width="1" height="1" alt="" />`;
        let personalizedContent = template.content.replace(/{{name}}/g, lead.name || 'Valued Customer');
        personalizedContent += trackingPixel;

        try {
          // Send real email
          await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: lead.email,
            subject: template.subject,
            html: personalizedContent
          });
          
          log.status = 'Sent';
          await log.save();
          sentCount++;
        } catch (sendErr) {
          console.error(`Failed to send to ${lead.email}:`, sendErr);
          log.status = 'Failed';
          await log.save();
        }
      }
      
      // Update stats
      emailCampaign.stats.sent = sentCount;
      emailCampaign.stats.delivered = sentCount; // Assuming delivery for now
      await emailCampaign.save();
    }

    res.json(emailCampaign);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- TRACKING PIXEL ROUTE (PUBLIC) ---

// @route   GET /api/emails/track/:trackingId
// @desc    Tracking pixel for opens
// @access  Public (No Auth required!)
router.get('/track/:trackingId', async (req, res) => {
  try {
    const log = await EmailLog.findOne({ trackingId: req.params.trackingId });
    if (log && !log.openedAt) {
      log.status = 'Opened';
      log.openedAt = Date.now();
      await log.save();
      
      // Update Campaign stats
      const campaign = await EmailCampaign.findById(log.emailCampaign);
      if (campaign) {
        campaign.stats.opened += 1;
        await campaign.save();
      }
    }
    
    // Send a 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pixel);
  } catch (err) {
    // Fail silently for pixel
    res.status(204).end();
  }
});

module.exports = router;
