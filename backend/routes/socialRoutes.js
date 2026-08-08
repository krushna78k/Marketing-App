const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const SocialPost = require('../models/SocialPost');
const SocialAnalytics = require('../models/SocialAnalytics');
const Integration = require('../models/Integration');
const { TwitterApi } = require('twitter-api-v2');

// Helper to get Twitter client
const getTwitterClient = (keys) => {
  if (!keys || !keys.apiKey || keys.apiKey === '') {
    return null;
  }
  return new TwitterApi({
    appKey: keys.apiKey,
    appSecret: keys.apiSecret,
    accessToken: keys.accessToken,
    accessSecret: keys.accessSecret,
  });
};

// --- POST ROUTES ---

// @route   GET /api/social/posts
// @desc    Get all social posts
router.get('/posts', auth, async (req, res) => {
  try {
    const posts = await SocialPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/social/posts
// @desc    Create a draft or scheduled social post
router.post('/posts', auth, async (req, res) => {
  try {
    const { content, mediaUrl, platforms, status, scheduledFor } = req.body;
    
    const newPost = new SocialPost({
      content, 
      mediaUrl, 
      platforms, 
      status, // 'Draft', 'Scheduled', 'Published'
      scheduledFor,
      createdBy: req.user.id
    });
    
    if (status === 'Published') {
      newPost.publishedAt = Date.now();
    }
    
    const integration = await Integration.findOne();
    const socialMediaKeys = integration?.socialMedia || {};

    let twitterClient = null;
    if (status === 'Published' && platforms.includes('X')) {
      const twitterKeys = socialMediaKeys.twitter;
      twitterClient = getTwitterClient(twitterKeys);
      if (!twitterClient) {
        return res.status(400).json({ msg: 'Twitter API keys are not configured in the Integrations Settings.' });
      }
      
      try {
        // Post the tweet live!
        await twitterClient.v2.tweet(content);
      } catch (twitterErr) {
        console.error('Twitter API Error:', twitterErr);
        return res.status(500).json({ msg: 'Failed to publish to X. Please check your API keys and app permissions.' });
      }
    }

    // Instagram logic
    if (status === 'Published' && platforms.includes('Instagram')) {
      const igToken = socialMediaKeys.instagram?.accessToken;
      const igUserId = socialMediaKeys.instagram?.userId;

      if (!igToken || !igUserId) {
        return res.status(400).json({ msg: 'Instagram API keys are not configured in the Integrations Settings.' });
      }

      if (!mediaUrl) {
        return res.status(400).json({ msg: 'Instagram requires an image or video attachment.' });
      }

      try {
        // 1. Create Media Container
        const createContainerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media?image_url=${encodeURIComponent(mediaUrl)}&caption=${encodeURIComponent(content)}&access_token=${igToken}`;
        
        const containerRes = await fetch(createContainerUrl, { method: 'POST' });
        const containerData = await containerRes.json();

        if (containerData.error) {
          console.error('Instagram Create Container Error:', containerData.error);
          return res.status(500).json({ msg: `Instagram Error: ${containerData.error.message}` });
        }

        const creationId = containerData.id;

        // 2. Publish Media Container
        const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${creationId}&access_token=${igToken}`;
        const publishRes = await fetch(publishUrl, { method: 'POST' });
        const publishData = await publishRes.json();

        if (publishData.error) {
          console.error('Instagram Publish Error:', publishData.error);
          return res.status(500).json({ msg: `Instagram Publish Error: ${publishData.error.message}` });
        }
      } catch (igErr) {
        console.error('Instagram Fetch Error:', igErr);
        return res.status(500).json({ msg: 'Failed to connect to Instagram Graph API.' });
      }
    }

    const post = await newPost.save();

    // If Published immediately, simulate generating analytics data
    if (status === 'Published') {
      for (const platform of platforms) {
        const analytics = new SocialAnalytics({
          post: post._id,
          platform,
          metrics: {
            likes: Math.floor(Math.random() * 500) + 10,
            comments: Math.floor(Math.random() * 50) + 1,
            shares: Math.floor(Math.random() * 30),
            views: Math.floor(Math.random() * 5000) + 100
          }
        });
        await analytics.save();
      }
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// --- ANALYTICS ROUTES ---

// @route   GET /api/social/analytics
// @desc    Get simulated aggregated analytics for all published posts
router.get('/analytics', auth, async (req, res) => {
  try {
    const analytics = await SocialAnalytics.find().populate('post', 'content publishedAt');
    
    // Aggregate by platform for dashboard
    const aggregated = {
      Facebook: { likes: 0, comments: 0, shares: 0, views: 0 },
      Instagram: { likes: 0, comments: 0, shares: 0, views: 0 },
      LinkedIn: { likes: 0, comments: 0, shares: 0, views: 0 },
      X: { likes: 0, comments: 0, shares: 0, views: 0 },
      YouTube: { likes: 0, comments: 0, shares: 0, views: 0 }
    };

    analytics.forEach(stat => {
      if (aggregated[stat.platform]) {
        aggregated[stat.platform].likes += stat.metrics.likes;
        aggregated[stat.platform].comments += stat.metrics.comments;
        aggregated[stat.platform].shares += stat.metrics.shares;
        aggregated[stat.platform].views += stat.metrics.views;
      }
    });

    res.json(aggregated);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
