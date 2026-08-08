const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  googleAnalytics: {
    trackingId: { type: String, default: '' }
  },
  googleAds: {
    developerToken: { type: String, default: '' },
    customerId: { type: String, default: '' }
  },
  metaAds: {
    accessToken: { type: String, default: '' },
    pixelId: { type: String, default: '' }
  },
  whatsappApi: {
    apiKey: { type: String, default: '' },
    phoneNumberId: { type: String, default: '' }
  },
  smtpEmail: {
    host: { type: String, default: '' },
    port: { type: String, default: '' },
    username: { type: String, default: '' },
    password: { type: String, default: '' }
  },
  paymentGateway: {
    stripeSecretKey: { type: String, default: '' },
    stripePublicKey: { type: String, default: '' }
  },
  crmPlatform: {
    hubspotApiKey: { type: String, default: '' },
    salesforceToken: { type: String, default: '' }
  },
  socialMedia: {
    twitter: {
      apiKey: { type: String, default: '' },
      apiSecret: { type: String, default: '' },
      accessToken: { type: String, default: '' },
      accessSecret: { type: String, default: '' }
    },
    instagram: {
      accessToken: { type: String, default: '' },
      userId: { type: String, default: '' }
    },
    facebook: {
      accessToken: { type: String, default: '' },
      pageId: { type: String, default: '' }
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Integration', integrationSchema);
