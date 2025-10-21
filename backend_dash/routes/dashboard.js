const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Website = require('../models/Website');
const DailyStats = require('../models/DailyStats');
const Event = require('../models/Event');
const authMiddleware = require('../utils/authMiddleware');
const { generateWebsiteId, isValidDomain, extractDomain } = require('../utils/helpers');

const router = express.Router();

// Initialize database tables
router.get('/init', authMiddleware, async (req, res) => {
  try {
    await DailyStats.createTable();
    res.json({ message: 'DailyStats table initialized successfully' });
  } catch (error) {
    console.error('Table initialization error:', error);
    res.status(500).json({ message: 'Failed to initialize tables' });
  }
});

// Get user's websites
router.get('/websites', authMiddleware, async (req, res) => {
  try {
    const websites = await Website.findByUserId(req.user.id);
    res.json({ websites });
  } catch (error) {
    console.error('Get websites error:', error);
    res.status(500).json({ message: 'Failed to fetch websites' });
  }
});

// Create new website
router.post('/websites', authMiddleware, [
  body('domain').custom((value) => {
    if (!isValidDomain(value)) {
      throw new Error('Invalid domain format');
    }
    return true;
  }),
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { domain, name, description } = req.body;
    const websiteId = generateWebsiteId();
    const normalizedDomain = extractDomain(domain);

    const website = await Website.create({
      user_id: req.user.id,
      domain: normalizedDomain,
      name,
      description: description || '',
      website_id: websiteId
    });

    res.status(201).json({
      message: 'Website created successfully',
      website
    });
  } catch (error) {
    console.error('Create website error:', error);
    res.status(500).json({ message: 'Failed to create website' });
  }
});

// Update website
router.put('/websites/:id', authMiddleware, [
  body('domain').optional().custom((value) => {
    if (value && !isValidDomain(value)) {
      throw new Error('Invalid domain format');
    }
    return true;
  }),
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { domain, name, description } = req.body;

    // Check if website belongs to user
    const existingWebsite = await Website.findById(id);
    if (!existingWebsite || existingWebsite.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const normalizedDomain = domain ? extractDomain(domain) : existingWebsite.domain;

    const updatedWebsite = await Website.updateById(id, {
      domain: normalizedDomain,
      name: name || existingWebsite.name,
      description: description !== undefined ? description : existingWebsite.description
    });

    res.json({
      message: 'Website updated successfully',
      website: updatedWebsite
    });
  } catch (error) {
    console.error('Update website error:', error);
    res.status(500).json({ message: 'Failed to update website' });
  }
});

// Delete website
router.delete('/websites/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if website belongs to user
    const website = await Website.findById(id);
    if (!website || website.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Website not found' });
    }

    await Website.deactivate(id);

    res.json({ message: 'Website deleted successfully' });
  } catch (error) {
    console.error('Delete website error:', error);
    res.status(500).json({ message: 'Failed to delete website' });
  }
});

// Get website overview stats
router.get('/:websiteId/overview', authMiddleware, [
  query('days').optional().isInt({ min: 1, max: 365 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { websiteId } = req.params;
    const days = parseInt(req.query.days) || 30;

    // Check if user owns this website
    console.log(`Checking ownership: websiteId=${websiteId}, userId=${req.user.id}`);
    const hasAccess = await Website.checkOwnership(websiteId, req.user.id);
    console.log(`Access check result: ${hasAccess}`);
    
    if (!hasAccess) {
      // Debug: Show user's websites
      const userWebsites = await Website.findByUserId(req.user.id);
      console.log('User websites:', userWebsites.map(w => ({ id: w.id, website_id: w.website_id, domain: w.domain })));
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await DailyStats.getOverviewStats(websiteId, days);
    
    res.json({
      websiteId,
      period: `${days} days`,
      stats: {
        totalVisits: parseInt(stats.total_visits) || 0,
        uniqueVisitors: parseInt(stats.unique_visitors) || 0,
        totalPageViews: parseInt(stats.total_page_views) || 0,
        avgDuration: parseFloat(stats.avg_duration) || 0,
        avgBounceRate: parseFloat(stats.avg_bounce_rate) || 0,
        daysWithData: parseInt(stats.days_with_data) || 0
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ message: 'Failed to fetch overview stats' });
  }
});

// Get daily chart data
router.get('/:websiteId/chart', authMiddleware, [
  query('days').optional().isInt({ min: 1, max: 365 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { websiteId } = req.params;
    const days = parseInt(req.query.days) || 30;

    // Check if user owns this website
    const hasAccess = await Website.checkOwnership(websiteId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const chartData = await DailyStats.getChartData(websiteId, days);
    
    res.json({
      websiteId,
      period: `${days} days`,
      chartData: chartData.map(day => ({
        date: day.date,
        visits: parseInt(day.total_visits) || 0,
        uniqueVisitors: parseInt(day.unique_visitors) || 0,
        pageViews: parseInt(day.page_views) || 0,
        avgDuration: parseFloat(day.avg_duration) || 0,
        bounceRate: parseFloat(day.bounce_rate) || 0
      }))
    });
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({ message: 'Failed to fetch chart data' });
  }
});

// Get top pages
router.get('/:websiteId/top-pages', authMiddleware, [
  query('days').optional().isInt({ min: 1, max: 365 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { websiteId } = req.params;
    const days = parseInt(req.query.days) || 30;

    // Check if user owns this website
    const hasAccess = await Website.checkOwnership(websiteId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const topPages = await DailyStats.getTopPages(websiteId, days);
    
    res.json({
      websiteId,
      period: `${days} days`,
      topPages: topPages.map(page => ({
        url: page.top_page,
        visits: parseInt(page.visits) || 0
      }))
    });
  } catch (error) {
    console.error('Get top pages error:', error);
    res.status(500).json({ message: 'Failed to fetch top pages' });
  }
});

// Get real-time stats (from MongoDB)
router.get('/:websiteId/realtime', authMiddleware, async (req, res) => {
  try {
    const { websiteId } = req.params;

    // Check if user owns this website
    const hasAccess = await Website.checkOwnership(websiteId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get events from last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const realtimeEvents = await Event.find({
      websiteId,
      timestamp: { $gte: thirtyMinutesAgo }
    }).sort({ timestamp: -1 }).limit(100);

    // Count unique sessions in last 30 minutes
    const uniqueSessions = new Set(realtimeEvents.map(event => event.sessionId)).size;

    // Get current page views (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const currentPageViews = await Event.countDocuments({
      websiteId,
      eventType: 'page_view',
      timestamp: { $gte: fiveMinutesAgo }
    });

    res.json({
      websiteId,
      timestamp: new Date().toISOString(),
      realtimeStats: {
        activeVisitors: uniqueSessions,
        recentPageViews: currentPageViews,
        recentEvents: realtimeEvents.slice(0, 10).map(event => ({
          eventType: event.eventType,
          url: event.url,
          timestamp: event.timestamp,
          device: event.device?.type || 'unknown'
        }))
      }
    });
  } catch (error) {
    console.error('Get realtime stats error:', error);
    res.status(500).json({ message: 'Failed to fetch realtime stats' });
  }
});

// Manual aggregation trigger for real-time dashboard updates
router.post('/:websiteId/aggregate', authMiddleware, async (req, res) => {
  try {
    const { websiteId } = req.params;
    
    // Check if user owns this website
    const hasAccess = await Website.checkOwnership(websiteId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Import aggregation job
    const AggregationJob = require('../cron/aggregateJob');
    const aggregator = new AggregationJob();
    
    // Run aggregation for today and yesterday
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Set up date ranges
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    const yesterdayStart = new Date(yesterday);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);
    
    await aggregator.aggregateWebsiteData(websiteId, today.toISOString().split('T')[0], todayStart, todayEnd);
    await aggregator.aggregateWebsiteData(websiteId, yesterday.toISOString().split('T')[0], yesterdayStart, yesterdayEnd);
    
    res.json({ 
      message: 'Data aggregation completed',
      processedDates: [
        today.toISOString().split('T')[0],
        yesterday.toISOString().split('T')[0]
      ]
    });
    
  } catch (error) {
    console.error('Manual aggregation error:', error);
    res.status(500).json({ message: 'Failed to run aggregation' });
  }
});

module.exports = router;