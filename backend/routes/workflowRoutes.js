const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const WorkflowExecution = require('../models/WorkflowExecution');
const Lead = require('../models/Lead');

// --- WORKFLOW BUILDER ROUTES ---

// @route   GET /api/workflows
// @desc    Get all workflows
router.get('/', auth, async (req, res) => {
  try {
    const workflows = await Workflow.find().sort({ createdAt: -1 });
    res.json(workflows);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/workflows
// @desc    Create or Update a workflow
router.post('/', auth, async (req, res) => {
  try {
    const { workflowId, name, trigger, nodes, status } = req.body;
    
    let workflow;
    if (workflowId) {
      workflow = await Workflow.findById(workflowId);
      if (!workflow) return res.status(404).json({ msg: 'Workflow not found' });
      
      workflow.name = name;
      workflow.trigger = trigger;
      workflow.nodes = nodes;
      workflow.status = status;
      await workflow.save();
    } else {
      workflow = new Workflow({
        name, trigger, nodes, status, createdBy: req.user.id
      });
      await workflow.save();
    }

    res.json(workflow);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- EXECUTION TRACKING ROUTES ---

// @route   GET /api/workflows/:id/executions
// @desc    Get all execution logs for a workflow
router.get('/:id/executions', auth, async (req, res) => {
  try {
    const executions = await WorkflowExecution.find({ workflowId: req.params.id })
      .populate('leadId', 'name email phone status')
      .sort({ updatedAt: -1 });
    res.json(executions);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- SIMULATED AUTOMATION ENGINE ---

// @route   POST /api/workflows/:id/trigger
// @desc    Manually trigger a workflow on a specific lead (Simulation Engine)
router.post('/:id/trigger', auth, async (req, res) => {
  try {
    const { leadId } = req.body;
    
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ msg: 'Workflow not found' });
    if (workflow.status !== 'Active') return res.status(400).json({ msg: 'Workflow must be Active to trigger' });
    
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ msg: 'Lead not found' });

    // Initialize Execution Record
    const execution = new WorkflowExecution({
      workflowId: workflow._id,
      leadId: lead._id,
      status: 'In Progress'
    });
    
    execution.logs.push({ actionType: 'System', message: `Workflow triggered for lead: ${lead.name}` });
    await execution.save();

    // SIMULATED EXECUTION LOOP (skips real world delays)
    let hasFailed = false;

    for (let i = 0; i < workflow.nodes.length; i++) {
      const node = workflow.nodes[i];
      execution.currentStepIndex = i;

      try {
        if (node.type === 'delay') {
           execution.logs.push({ actionType: 'Delay', message: `Simulated Delay: ${node.label}` });
        } 
        else if (node.type === 'email') {
           if (!lead.email) throw new Error('Lead has no email address');
           execution.logs.push({ actionType: 'Email', message: `Simulated Email Sent: ${node.label} to ${lead.email}` });
        }
        else if (node.type === 'sms') {
           if (!lead.phone) throw new Error('Lead has no phone number');
           execution.logs.push({ actionType: 'SMS', message: `Simulated SMS Sent: ${node.label} to ${lead.phone}` });
        }
        else if (node.type === 'whatsapp') {
           if (!lead.phone) throw new Error('Lead has no phone number for WhatsApp');
           execution.logs.push({ actionType: 'WhatsApp', message: `Simulated WhatsApp Sent: ${node.label} to ${lead.phone}` });
        }
        else if (node.type === 'assignment') {
           lead.status = 'Qualified'; // Example automatic assignment logic
           await lead.save();
           execution.logs.push({ actionType: 'Update', message: `Simulated Lead Assignment: Status updated to Qualified` });
        }
      } catch (err) {
        hasFailed = true;
        execution.logs.push({ actionType: 'Error', message: `Failed at Step ${i+1}: ${err.message}` });
        break; // Stop execution on failure
      }
    }

    // Finalize
    execution.status = hasFailed ? 'Failed' : 'Completed';
    if (!hasFailed) {
      execution.logs.push({ actionType: 'System', message: 'Workflow completed successfully.' });
    }
    
    await execution.save();

    res.json({ msg: `Execution finished with status: ${execution.status}`, executionId: execution._id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
