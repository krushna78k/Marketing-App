const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Lead = require('../models/Lead');
const Campaign = require('../models/Campaign');
const Deal = require('../models/Deal');
const AuditLog = require('../models/AuditLog');
const Task = require('../models/Task');
const EmailLog = require('../models/EmailLog');
const SmsLog = require('../models/SmsLog');
const WhatsAppLog = require('../models/WhatsAppLog');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard metrics and chart data
// @access  Private (All Roles can view)
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Basic Metrics
    const totalLeads = await Lead.countDocuments();
    const qualifiedLeads = await Lead.countDocuments({ status: { $in: ['Qualified', 'Proposal Sent', 'Won'] } });
    const activeCampaigns = await Campaign.countDocuments({ status: 'Active' });
    const totalCampaigns = await Campaign.countDocuments();
    
    const wonLeads = await Lead.countDocuments({ status: 'Won' });
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

    // Financial Metrics
    const campaignsWithBudget = await Campaign.find({ budget: { $exists: true } });
    const marketingSpend = campaignsWithBudget.reduce((acc, curr) => acc + (curr.budget || 0), 0);
    
    const wonDeals = await Deal.find({ stage: 'Closed Won' });
    const revenueGenerated = wonDeals.reduce((acc, curr) => acc + (curr.value || 0), 0);
    
    const roi = marketingSpend > 0 ? (((revenueGenerated - marketingSpend) / marketingSpend) * 100).toFixed(1) : 0;

    // Leads Over Time (Last 7 Days) for Line Chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);

    const leadsByDate = await Lead.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for recharts: fill in missing days
    const lineChartData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      
      const found = leadsByDate.find(x => x._id === dateString);
      lineChartData.push({
        date: dateString.substring(5), // e.g. "08-07"
        leads: found ? found.count : 0
      });
    }

    // Campaigns by Type for Pie Chart
    const campaignsByTypeRaw = await Campaign.aggregate([
      {
        $group: {
          _id: "$type",
          value: { $sum: 1 }
        }
      }
    ]);
    
    const pieChartData = campaignsByTypeRaw.map(item => ({
      name: item._id,
      value: item.value
    }));

    // Recent Activities
    const recentActivities = await AuditLog.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name');

    // Upcoming Campaigns (Start Date >= Today)
    const today = new Date();
    today.setHours(0,0,0,0);
    const upcomingCampaigns = await Campaign.find({ startDate: { $gte: today } }).sort({ startDate: 1 }).limit(5);

    // Notifications (Pending Tasks for user)
    const notifications = await Task.find({ assignedTo: req.user.id, status: 'Pending' }).sort({ dueDate: 1 }).limit(5);

    res.json({
      metrics: {
        totalLeads,
        qualifiedLeads,
        totalCampaigns,
        activeCampaigns,
        conversionRate,
        marketingSpend,
        revenueGenerated,
        roi
      },
      charts: {
        leadsOverTime: lineChartData,
        campaignsByType: pieChartData
      },
      lists: {
        recentActivities,
        upcomingCampaigns,
        notifications
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/analytics/reports
// @desc    Get advanced deep-dive reporting data (Channels & Sources)
// @access  Private
router.get('/reports', auth, async (req, res) => {
  try {
    // Lead Sources Aggregation
    const sourcesAgg = await Lead.aggregate([
      { $group: { _id: "$source", value: { $sum: 1 } } }
    ]);
    const leadSources = sourcesAgg.map(s => ({
      name: s._id || 'Unknown',
      value: s.value
    }));

    // Email Analytics (from EmailLogs)
    const emailTotal = await EmailLog.countDocuments();
    const emailDelivered = await EmailLog.countDocuments({ status: { $in: ['Delivered', 'Opened', 'Clicked'] } });
    const emailOpened = await EmailLog.countDocuments({ status: { $in: ['Opened', 'Clicked'] } });
    const emailBounced = await EmailLog.countDocuments({ status: 'Bounced' });
    
    // SMS Analytics (from SmsLogs)
    const smsTotal = await SmsLog.countDocuments();
    const smsDelivered = await SmsLog.countDocuments({ status: 'Delivered' });
    const smsFailed = await SmsLog.countDocuments({ status: 'Failed' });

    // WhatsApp Analytics (from WhatsAppLogs)
    const waTotal = await WhatsAppLog.countDocuments();
    const waRead = await WhatsAppLog.countDocuments({ status: 'Read' });
    const waDelivered = await WhatsAppLog.countDocuments({ status: 'Delivered' }); // Delivered but not read

    // General Conversion Funnel
    const totalLeads = await Lead.countDocuments();
    const qualifiedLeads = await Lead.countDocuments({ status: 'Qualified' });
    const proposalLeads = await Lead.countDocuments({ status: 'Proposal Sent' });
    const wonLeads = await Lead.countDocuments({ status: 'Won' });

    res.json({
      sources: leadSources,
      email: {
        total: emailTotal,
        delivered: emailDelivered,
        opened: emailOpened,
        bounced: emailBounced
      },
      sms: {
        total: smsTotal,
        delivered: smsDelivered,
        failed: smsFailed
      },
      whatsapp: {
        total: waTotal,
        delivered: waDelivered,
        read: waRead
      },
      funnel: [
        { name: 'Total Leads', value: totalLeads },
        { name: 'Qualified', value: qualifiedLeads },
        { name: 'Proposal Sent', value: proposalLeads },
        { name: 'Closed Won', value: wonLeads }
      ]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
