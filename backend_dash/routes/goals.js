const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Goal = require('../models/Goal');
const Website = require('../models/Website');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// Initialize goal tables
router.get('/init', authMiddleware, async (req, res) => {
  try {
    await Goal.createTable();
    res.json({ message: 'Goals table initialized successfully' });
  } catch (error) {
    console.error('Goal table initialization error:', error);
    res.status(500).json({ message: 'Failed to initialize goals table' });
  }
});

// Validation middleware for creating goals
const validateGoalCreation = [
  body('website_id').notEmpty().trim().withMessage('Website ID is required'),
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('goal_type').isIn(['url_destination', 'event', 'page_duration', 'form_submit', 'click', 'download']).withMessage('Invalid goal type'),
  body('conditions').isObject().withMessage('Conditions must be an object'),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
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

// Create new goal
router.post('/', authMiddleware, validateGoalCreation, async (req, res) => {
  try {

    const { website_id, name, description, goal_type, conditions, value } = req.body;

    // Verify that the website belongs to the user
    const websites = await Website.findByUserId(req.user.id);
    const website = websites.find(w => w.website_id === website_id);
    
    if (!website) {
      return res.status(404).json({ 
        message: 'Website not found or access denied' 
      });
    }

    // Validate goal conditions based on type
    const validationResult = validateGoalConditions(goal_type, conditions);
    if (!validationResult.valid) {
      console.error('Goal validation failed:', validationResult.errors);
      return res.status(400).json({ 
        message: 'Invalid goal conditions', 
        errors: validationResult.errors 
      });
    }

    console.log('Creating goal with data:', { website_id, user_id: req.user.id, name, goal_type, conditions, value });

    const goal = await Goal.create({
      website_id,
      user_id: req.user.id,
      name,
      description: description || '',
      goal_type,
      conditions,
      value: value || 0
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    console.error('Request body:', req.body);
    console.error('User:', req.user);
    res.status(500).json({ 
      message: 'Failed to create goal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all goals for a website
router.get('/', authMiddleware, [
  query('website_id').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { website_id } = req.query;

    // Verify that the website belongs to the user
    const websites = await Website.findByUserId(req.user.id);
    const website = websites.find(w => w.website_id === website_id);
    
    if (!website) {
      return res.status(404).json({ 
        message: 'Website not found or access denied' 
      });
    }

    const goals = await Goal.findByWebsiteId(website_id, req.user.id);

    res.json({
      success: true,
      goals,
      count: goals.length
    });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Failed to fetch goals' });
  }
});

// Get specific goal by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const goal = await Goal.findById(id, req.user.id);
    
    if (!goal) {
      return res.status(404).json({ 
        message: 'Goal not found or access denied' 
      });
    }

    res.json({
      success: true,
      goal
    });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ message: 'Failed to fetch goal' });
  }
});

// Validation middleware for updating goals
const validateGoalUpdate = [
  body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('goal_type').optional().isIn(['url_destination', 'event', 'page_duration', 'form_submit', 'click', 'download']).withMessage('Invalid goal type'),
  body('conditions').optional().isObject().withMessage('Conditions must be an object'),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
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

// Update goal
router.put('/:id', authMiddleware, validateGoalUpdate, async (req, res) => {
  try {

    const { id } = req.params;
    const updateData = req.body;

    // Validate goal conditions if provided
    if (updateData.goal_type && updateData.conditions) {
      const validationResult = validateGoalConditions(updateData.goal_type, updateData.conditions);
      if (!validationResult.valid) {
        return res.status(400).json({ 
          message: 'Invalid goal conditions', 
          errors: validationResult.errors 
        });
      }
    }

    const goal = await Goal.update(id, req.user.id, updateData);
    
    if (!goal) {
      return res.status(404).json({ 
        message: 'Goal not found or access denied' 
      });
    }

    res.json({
      success: true,
      message: 'Goal updated successfully',
      goal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Failed to update goal' });
  }
});

// Delete goal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Goal.delete(id, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        message: 'Goal not found or access denied' 
      });
    }

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Failed to delete goal' });
  }
});

// Get goal conversions
router.get('/:id/conversions', authMiddleware, [
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
  query('offset').optional().isInt({ min: 0 })
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
    const { start_date, end_date, limit, offset } = req.query;

    // Verify goal belongs to user
    const goal = await Goal.findById(id, req.user.id);
    if (!goal) {
      return res.status(404).json({ 
        message: 'Goal not found or access denied' 
      });
    }

    const options = {
      startDate: start_date,
      endDate: end_date,
      limit: parseInt(limit) || 100,
      offset: parseInt(offset) || 0
    };

    const [conversions, stats] = await Promise.all([
      Goal.getConversions(id, req.user.id, options).catch(err => {
        console.error('Error fetching conversions:', err);
        return [];
      }),
      Goal.getConversionStats(id, req.user.id, options).catch(err => {
        console.error('Error fetching stats:', err);
        return [];
      })
    ]);

    res.json({
      success: true,
      goal: {
        id: goal.id,
        name: goal.name,
        goal_type: goal.goal_type
      },
      conversions,
      stats,
      pagination: {
        limit: options.limit,
        offset: options.offset,
        has_more: conversions.length === options.limit
      }
    });
  } catch (error) {
    console.error('Get goal conversions error:', error);
    res.status(500).json({ message: 'Failed to fetch goal conversions' });
  }
});

// Validation middleware for conversion tracking
const validateConversionTracking = [
  body('session_id').notEmpty().trim().withMessage('Session ID is required'),
  body('page_url').isURL().withMessage('Valid page URL is required'),
  body('conversion_value').optional().isFloat({ min: 0 }).withMessage('Conversion value must be a positive number'),
  body('custom_data').optional().isObject().withMessage('Custom data must be an object'),
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

// Manual conversion tracking (for testing or manual records)
router.post('/:id/conversions', authMiddleware, validateConversionTracking, async (req, res) => {
  try {

    const { id } = req.params;
    const { session_id, page_url, conversion_value, custom_data } = req.body;

    // Verify goal belongs to user
    const goal = await Goal.findById(id, req.user.id);
    if (!goal) {
      return res.status(404).json({ 
        message: 'Goal not found or access denied' 
      });
    }

    const conversionData = {
      goal_id: id,
      website_id: goal.website_id,
      session_id,
      page_url,
      conversion_value: conversion_value || goal.value || 0,
      custom_data: custom_data || {},
      user_agent: req.headers['user-agent'] || '',
      ip_address: req.ip || req.connection.remoteAddress || '',
      referrer: req.headers.referer || ''
    };

    const conversion = await Goal.recordConversion(conversionData);

    res.status(201).json({
      success: true,
      message: 'Conversion recorded successfully',
      conversion
    });
  } catch (error) {
    console.error('Record conversion error:', error);
    res.status(500).json({ message: 'Failed to record conversion' });
  }
});

// Helper function to validate goal conditions
function validateGoalConditions(goalType, conditions) {
  const errors = [];
  
  switch (goalType) {
    case 'url_destination':
      if (!conditions.url) {
        errors.push('URL is required for url_destination goals');
      }
      if (!conditions.match_type || !['exact', 'contains', 'regex', 'starts_with', 'ends_with'].includes(conditions.match_type)) {
        errors.push('match_type must be one of: exact, contains, regex, starts_with, ends_with');
      }
      break;
      
    case 'event':
      if (!conditions.event_type) {
        errors.push('event_type is required for event goals');
      }
      break;
      
    case 'page_duration':
      if (!conditions.duration || conditions.duration < 0) {
        errors.push('duration (in seconds) is required for page_duration goals');
      }
      break;
      
    case 'form_submit':
      // Form submit goals can have optional selector or form_id
      break;
      
    case 'click':
      if (!conditions.selector && !conditions.element_id) {
        errors.push('selector or element_id is required for click goals');
      }
      break;
      
    case 'download':
      // Download goals are flexible - can match by fileName, fileUrl, or fileType
      // At least one condition should be provided, but not strictly required
      if (conditions.match_type && !['exact', 'contains', 'regex'].includes(conditions.match_type)) {
        errors.push('match_type for download goals must be one of: exact, contains, regex');
      }
      break;
      
    default:
      errors.push('Invalid goal type');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Manual trigger for goal completion processing (Global Analytics Feature)
router.post('/process-completions', authMiddleware, async (req, res) => {
  try {
    console.log('🎯 Manual goal completion processing triggered');
    
    const { website_id } = req.query;
    let targetWebsiteId = website_id;
    
    // If no website specified, get user's websites
    if (!targetWebsiteId) {
      const websites = await Website.findByUserId(req.user.id);
      if (websites.length === 0) {
        return res.status(404).json({ message: 'No websites found' });
      }
      targetWebsiteId = websites[0].website_id;
    }
    
    console.log(`🔍 Processing goal completions for website: ${targetWebsiteId}`);
    
    // Get recent events for this website
    const Event = require('../models/Event');
    const recentEvents = await Event.find({
      websiteId: targetWebsiteId,
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ timestamp: -1 }).limit(100);
    
    console.log(`📋 Found ${recentEvents.length} recent events`);
    
    let conversionsRecorded = 0;
    
    for (const event of recentEvents) {
      const eventData = {
        eventType: event.eventType,
        url: event.url,
        referrer: event.referrer,
        duration: event.duration,
        customData: event.customData
      };
      
      const completedGoals = await Goal.checkGoalCompletion(targetWebsiteId, eventData);
      
      for (const goal of completedGoals) {
        // Check if conversion already exists
        const { sql } = require('../config/neon').getNeonDB();
        const existingConversion = await sql`
          SELECT id FROM goal_conversions 
          WHERE goal_id = ${goal.id} 
            AND session_id = ${event.sessionId}
            AND event_id = ${event._id.toString()}
        `;
        
        if (existingConversion.length === 0) {
          await Goal.recordConversion({
            goal_id: goal.id,
            website_id: targetWebsiteId,
            session_id: event.sessionId,
            event_id: event._id.toString(),
            user_agent: event.userAgent,
            ip_address: event.ipAddress,
            referrer: event.referrer,
            page_url: event.url,
            conversion_value: goal.value || 0,
            custom_data: event.customData
          });
          
          conversionsRecorded++;
          console.log(`✅ Recorded conversion for goal: ${goal.name}`);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Goal completion processing completed successfully',
      stats: {
        eventsProcessed: recentEvents.length,
        conversionsRecorded: conversionsRecorded,
        websiteId: targetWebsiteId
      }
    });
    
  } catch (error) {
    console.error('Manual goal processing error:', error);
    res.status(500).json({ 
      message: 'Failed to process goal completions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;