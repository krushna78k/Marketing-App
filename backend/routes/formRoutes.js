const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const CustomForm = require('../models/CustomForm');
const FormSubmission = require('../models/FormSubmission');
const Lead = require('../models/Lead');

// --- FORM BUILDER ROUTES ---

// @route   GET /api/forms
// @desc    Get all custom forms
router.get('/', auth, async (req, res) => {
  try {
    const forms = await CustomForm.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/forms
// @desc    Create or Update a custom form
router.post('/', auth, async (req, res) => {
  try {
    const { formId, title, type, fields, settings } = req.body;
    
    let form;
    if (formId) {
      form = await CustomForm.findById(formId);
      if (!form) return res.status(404).json({ msg: 'Form not found' });
      
      form.title = title;
      form.type = type;
      form.fields = fields;
      form.settings = settings;
      await form.save();
    } else {
      form = new CustomForm({
        title, type, fields, settings, createdBy: req.user.id
      });
      await form.save();
    }

    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- PUBLIC SUBMISSION ROUTE ---

// @route   POST /api/forms/public/submit/:formId
// @desc    Handle public form submission, run validation, and trigger webhooks
router.post('/public/submit/:formId', async (req, res) => {
  try {
    const form = await CustomForm.findById(req.params.formId);
    if (!form) return res.status(404).json({ msg: 'Form not found' });

    const payload = req.body;

    // 1. Validation Logic
    for (const field of form.fields) {
      if (field.required && !payload[field.id]) {
        return res.status(400).json({ msg: `Validation Error: ${field.label} is required.` });
      }
      if (field.type === 'email' && payload[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload[field.id])) {
          return res.status(400).json({ msg: `Validation Error: ${field.label} must be a valid email.` });
        }
      }
    }

    // 2. Save Raw Submission
    const submission = new FormSubmission({
      formId: form._id,
      payload
    });
    await submission.save();

    // 3. Create Lead (If it's a Lead Form)
    if (form.type === 'Lead Form') {
      // Attempt to map dynamic fields to standard Lead schema based on field labels
      let nameField = form.fields.find(f => f.label.toLowerCase().includes('name'));
      let emailField = form.fields.find(f => f.label.toLowerCase().includes('email'));
      let phoneField = form.fields.find(f => f.label.toLowerCase().includes('phone'));

      const newLead = new Lead({
        name: nameField ? payload[nameField.id] : 'Unknown',
        email: emailField ? payload[emailField.id] : '',
        phone: phoneField ? payload[phoneField.id] : '',
        source: form.title,
        status: 'New'
      });
      await newLead.save();
    }

    // 4. Trigger Webhook (Simulated)
    if (form.settings && form.settings.webhookUrl) {
      try {
        console.log(`[Webhook] Firing POST to ${form.settings.webhookUrl}...`);
        // We simulate this by logging, but in reality we would do:
        // await axios.post(form.settings.webhookUrl, { formId: form._id, payload });
      } catch (webhookErr) {
        console.error('Webhook failed', webhookErr.message);
      }
    }
    
    // 5. Trigger Email Notification (Simulated)
    if (form.settings && form.settings.emailNotifications) {
      console.log(`[Email] Sending notification to ${form.settings.emailNotifications}...`);
    }

    res.status(200).json({ msg: 'Form submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
