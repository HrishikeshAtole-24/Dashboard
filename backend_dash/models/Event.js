const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  websiteId: {
    type: String,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['page_view', 'click', 'scroll', 'form_submit', 'download', 'custom'],
    default: 'page_view'
  },
  url: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    default: null // Anonymous by default
  },
  duration: {
    type: Number,
    default: 0 // Time spent on page in seconds
  },
  viewport: {
    width: Number,
    height: Number
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile', 'unknown'],
      default: 'unknown'
    },
    os: String,
    browser: String
  },
  location: {
    country: String,
    city: String,
    timezone: String
  },
  customData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'events'
});

// Indexes for better performance
eventSchema.index({ websiteId: 1, timestamp: -1 });
eventSchema.index({ websiteId: 1, eventType: 1, timestamp: -1 });
eventSchema.index({ sessionId: 1, timestamp: -1 });
eventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

module.exports = mongoose.model('Event', eventSchema);