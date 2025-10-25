const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Website = require('../models/Website');
const DailyStats = require('../models/DailyStats');
const Event = require('../models/Event');
const Goal = require('../models/Goal');
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

// Get referrer analytics
router.get('/:websiteId/referrers', authMiddleware, [
  query('days').optional().isInt({ min: 1, max: 365 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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
    const limit = parseInt(req.query.limit) || 10;

    // Check if user owns this website
    const hasAccess = await Website.checkOwnership(websiteId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get MongoDB connection
    const Event = require('../models/Event');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate referrer data from MongoDB
    const referrerStats = await Event.aggregate([
      {
        $match: {
          websiteId: websiteId,
          eventType: 'page_view',
          timestamp: {
            $gte: startDate,
            $lte: endDate
          },
          referrer: { $exists: true, $ne: '', $ne: null }
        }
      },
      {
        $addFields: {
          referrerDomain: {
            $cond: {
              if: { $eq: ['$referrer', ''] },
              then: 'Direct',
              else: {
                $let: {
                  vars: {
                    urlParts: { $split: ['$referrer', '/'] }
                  },
                  in: {
                    $cond: {
                      if: { $gte: [{ $size: '$$urlParts' }, 3] },
                      then: { $arrayElemAt: ['$$urlParts', 2] },
                      else: 'Direct'
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$referrerDomain',
          visitors: { $addToSet: '$sessionId' },
          pageViews: { $sum: 1 }
        }
      },
      {
        $addFields: {
          visitors: { $size: '$visitors' }
        }
      },
      {
        $sort: { visitors: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          visitors: 1,
          pageViews: 1
        }
      }
    ]);

    // Calculate total visitors for percentage calculation
    const totalVisitors = referrerStats.reduce((sum, referrer) => sum + referrer.visitors, 0);

    // Add percentage to each referrer
    const referrersWithPercentage = referrerStats.map(referrer => ({
      ...referrer,
      percentage: totalVisitors > 0 ? (referrer.visitors / totalVisitors * 100).toFixed(1) : 0
    }));

    res.json({
      websiteId,
      period: `${days} days`,
      referrers: referrersWithPercentage,
      totalVisitors
    });

  } catch (error) {
    console.error('Get referrers error:', error);
    res.status(500).json({ message: 'Failed to fetch referrer stats' });
  }
});

// Get geographic analytics
router.get('/:websiteId/geographic', authMiddleware, [
  query('days').optional().isInt({ min: 1, max: 365 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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
    const limit = parseInt(req.query.limit) || 10;

    // Check if user owns this website
    const hasAccess = await Website.checkOwnership(websiteId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get MongoDB connection
    const Event = require('../models/Event');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Aggregate geographic data from MongoDB
    const geographicStats = await Event.aggregate([
      {
        $match: {
          websiteId: websiteId,
          eventType: 'page_view',
          timestamp: {
            $gte: startDate,
            $lte: endDate
          },
          ipAddress: { $exists: true, $ne: '', $ne: null }
        }
      },
      {
        $addFields: {
          // For now, we'll map localhost IPs to a default location
          // In production, you'd use a real IP geolocation service
          location: {
            $cond: {
              if: { 
                $or: [
                  { $eq: ['$ipAddress', '::1'] },
                  { $eq: ['$ipAddress', '127.0.0.1'] },
                  { $regexMatch: { input: '$ipAddress', regex: /^192\.168\./ } },
                  { $regexMatch: { input: '$ipAddress', regex: /^10\./ } },
                  { $regexMatch: { input: '$ipAddress', regex: /^172\./ } }
                ]
              },
              then: {
                country: 'Local/Development',
                countryCode: 'DEV',
                city: 'Localhost',
                region: 'Development'
              },
              else: {
                // For real IPs, you would call a geolocation service here
                // For now, we'll assign some sample data based on IP patterns
                country: 'Unknown',
                countryCode: 'UN',
                city: 'Unknown',
                region: 'Unknown'
              }
            }
          }
        }
      },
      {
        $group: {
          _id: {
            country: '$location.country',
            countryCode: '$location.countryCode'
          },
          visitors: { $addToSet: '$sessionId' },
          pageViews: { $sum: 1 }
        }
      },
      {
        $addFields: {
          visitors: { $size: '$visitors' }
        }
      },
      {
        $sort: { visitors: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: 0,
          country: '$_id.country',
          countryCode: '$_id.countryCode',
          visitors: 1,
          pageViews: 1
        }
      }
    ]);

    // Calculate total visitors for percentage calculation
    const totalVisitors = geographicStats.reduce((sum, geo) => sum + geo.visitors, 0);

    // Add percentage to each country
    const geographicWithPercentage = geographicStats.map(geo => ({
      ...geo,
      percentage: totalVisitors > 0 ? (geo.visitors / totalVisitors * 100).toFixed(1) : 0
    }));

    res.json({
      websiteId,
      period: `${days} days`,
      geographic: geographicWithPercentage,
      totalVisitors
    });

  } catch (error) {
    console.error('Get geographic error:', error);
    res.status(500).json({ message: 'Failed to fetch geographic stats' });
  }
});

// Validation middleware for conversion rates analytics
const validateConversionRatesQuery = [
  query('website_id').notEmpty().trim().withMessage('Website ID is required'),
  query('start_date').optional().isISO8601().withMessage('Start date must be in ISO8601 format'),
  query('end_date').optional().isISO8601().withMessage('End date must be in ISO8601 format'),
  query('goal_id').optional().isInt().withMessage('Goal ID must be an integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    next();
  }
];

// Get conversion rates analytics
router.get('/analytics/conversion-rates', authMiddleware, validateConversionRatesQuery, async (req, res) => {
  try {

    const { website_id, start_date, end_date, goal_id } = req.query;

    // Verify that the website belongs to the user
    const websites = await Website.findByUserId(req.user.id);
    const website = websites.find(w => w.website_id === website_id);
    
    if (!website) {
      return res.status(404).json({ 
        message: 'Website not found or access denied' 
      });
    }

    const options = {
      startDate: start_date,
      endDate: end_date,
      goalId: goal_id ? parseInt(goal_id) : null
    };

    const conversionRates = await Goal.getConversionRates(website_id, req.user.id, options);

    res.json({
      success: true,
      website_id,
      conversion_rates: conversionRates,
      period: {
        start_date: start_date || 'all_time',
        end_date: end_date || 'now'
      }
    });
  } catch (error) {
    console.error('Get conversion rates error:', error);
    res.status(500).json({ message: 'Failed to fetch conversion rates' });
  }
});

module.exports = router;