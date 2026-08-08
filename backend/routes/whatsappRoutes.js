const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { auth, authorize } = require('../middleware/auth');
const WhatsAppTemplate = require('../models/WhatsAppTemplate');
const WhatsAppCampaign = require('../models/WhatsAppCampaign');
const WhatsAppLog = require('../models/WhatsAppLog');
const Lead = require('../models/Lead');

// --- TEMPLATE ROUTES ---

// @route   GET /api/whatsapp/templates
// @desc    Get all WhatsApp templates
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await WhatsAppTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/whatsapp/templates
// @desc    Create a WhatsApp template
router.post('/templates', auth, async (req, res) => {
  try {
    const { name, content, mediaUrl } = req.body;
    const newTemplate = new WhatsAppTemplate({
      name, content, mediaUrl, createdBy: req.user.id
    });
    const template = await newTemplate.save();
    res.json(template);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- DISPATCH ROUTE (SIMULATED) ---

// @route   POST /api/whatsapp/dispatch
// @desc    Simulate bulk sending a WhatsApp campaign
router.post('/dispatch', auth, async (req, res) => {
  try {
    const { title, templateId, scheduledFor } = req.body;
    
    const whatsappCampaign = new WhatsAppCampaign({
      title,
      template: templateId,
      status: scheduledFor ? 'Scheduled' : 'Completed',
      scheduledFor,
      createdBy: req.user.id
    });
    await whatsappCampaign.save();

    if (!scheduledFor) {
      if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_ID) {
        return res.status(500).json({ msg: 'WhatsApp credentials not configured in .env' });
      }

      const template = await WhatsAppTemplate.findById(templateId);
      const leads = await Lead.find({ phone: { $exists: true, $ne: '' } });
      
      let sentCount = 0;
      let failedCount = 0;
      
      for (const lead of leads) {
        const trackingId = crypto.randomBytes(16).toString('hex');
        let status = 'Failed';
        
        try {
          // Personalization injection
          const personalizedContent = template.content.replace(/{{name}}/g, lead.name || 'Customer');
          
          const response = await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: lead.phone.replace('+', ''), // WhatsApp API expects phone without +
              type: 'text',
              text: { body: personalizedContent }
            })
          });
          
          const data = await response.json();
          
          if (response.ok && data.messages) {
            status = 'Sent';
            sentCount++;
          } else {
            console.error(`Failed to send WhatsApp to ${lead.phone}:`, data);
            failedCount++;
          }
        } catch (waErr) {
          console.error(`Error sending WhatsApp to ${lead.phone}:`, waErr.message);
          failedCount++;
        }
        
        const log = new WhatsAppLog({
          whatsappCampaign: whatsappCampaign._id,
          recipientPhone: lead.phone,
          recipientId: lead._id,
          status,
          trackingId
        });
        
        await log.save();
      }
      
      whatsappCampaign.stats.sent = sentCount;
      whatsappCampaign.stats.failed = failedCount;
      whatsappCampaign.stats.delivered = sentCount; 
      whatsappCampaign.stats.read = 0; 
      await whatsappCampaign.save();
    }

    res.json(whatsappCampaign);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- DELIVERY & READ WEBHOOK ROUTE (MOCKED) ---

// @route   POST /api/whatsapp/webhook/:trackingId
// @desc    Mock webhook for WhatsApp delivery/read reports (usually called by Meta API)
// @access  Public
router.post('/webhook/:trackingId', async (req, res) => {
  try {
    const { status } = req.body; // 'Delivered' (grey ticks), 'Read' (blue ticks), 'Failed'
    
    const log = await WhatsAppLog.findOne({ trackingId: req.params.trackingId });
    if (log && log.status !== status) {
      // Only upgrade status linearly (Sent -> Delivered -> Read)
      if (status === 'Delivered' && log.status === 'Sent') {
        log.status = 'Delivered';
        log.deliveredAt = Date.now();
      } else if (status === 'Read' && (log.status === 'Sent' || log.status === 'Delivered')) {
        log.status = 'Read';
        if (!log.deliveredAt) log.deliveredAt = Date.now();
        log.readAt = Date.now();
      } else if (status === 'Failed') {
        log.status = 'Failed';
      }
      await log.save();
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
