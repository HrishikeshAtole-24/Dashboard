const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Website = require('../models/Website');
const { parseUserAgent, sanitizeUrl, generateSessionId } = require('../utils/helpers');

const router = express.Router();

// Initialize database tables
router.get('/init', async (req, res) => {
  try {
    await Website.createTable();
    res.json({ message: 'Website table initialized successfully' });
  } catch (error) {
    console.error('Table initialization error:', error);
    res.status(500).json({ message: 'Failed to initialize tables' });
  }
});

// Collect analytics events
router.post('/', [
  body('websiteId').notEmpty().trim(),
  body('eventType').isIn(['page_view', 'click', 'scroll', 'form_submit', 'download', 'custom']),
  body('url').isURL(),
  body('userAgent').notEmpty(),
  body('timestamp').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      websiteId,
      eventType = 'page_view',
      url,
      referrer = '',
      userAgent,
      sessionId,
      userId = null,
      duration = 0,
      viewport,
      customData = {},
      timestamp
    } = req.body;

    // Verify website exists
    const website = await Website.findByWebsiteId(websiteId);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Get client IP
    const ipAddress = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     '0.0.0.0';

    // Parse user agent
    const deviceInfo = parseUserAgent(userAgent);

    // Generate session ID if not provided
    const finalSessionId = sessionId || generateSessionId();

    // Sanitize URL
    const sanitizedUrl = sanitizeUrl(url);

    // Create event document
    const eventData = {
      websiteId,
      eventType,
      url: sanitizedUrl,
      referrer: referrer || '',
      userAgent,
      ipAddress,
      sessionId: finalSessionId,
      userId,
      duration,
      viewport: viewport || { width: 0, height: 0 },
      device: {
        type: deviceInfo.device,
        os: deviceInfo.os,
        browser: deviceInfo.browser
      },
      customData,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    };

    // Save to MongoDB
    const event = new Event(eventData);
    await event.save();

    // Check for goal completions
    const Goal = require('../models/Goal');
    try {
      const completedGoals = await Goal.checkGoalCompletion(websiteId, eventData);
      
      // Record conversions for completed goals
      for (const goal of completedGoals) {
        await Goal.recordConversion({
          goal_id: goal.id,
          website_id: websiteId,
          session_id: finalSessionId,
          event_id: event._id.toString(),
          user_agent: userAgent,
          ip_address: ipAddress,
          referrer: referrer || '',
          page_url: sanitizedUrl,
          conversion_value: goal.value || 0,
          custom_data: customData || {}
        });
        
        console.log(`✅ Goal conversion recorded: ${goal.name} (ID: ${goal.id})`);
      }
    } catch (goalError) {
      console.error('Goal checking error:', goalError);
      // Don't fail the event collection if goal checking fails
    }

    res.status(201).json({
      message: 'Event collected successfully',
      eventId: event._id,
      sessionId: finalSessionId
    });

  } catch (error) {
    console.error('Event collection error:', error);
    res.status(500).json({ message: 'Failed to collect event' });
  }
});

// Batch collect multiple events
router.post('/batch', [
  body('events').isArray({ min: 1, max: 100 }),
  body('events.*.websiteId').notEmpty().trim(),
  body('events.*.eventType').isIn(['page_view', 'click', 'scroll', 'form_submit', 'download', 'custom']),
  body('events.*.url').isURL(),
  body('events.*.userAgent').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { events } = req.body;
    const processedEvents = [];
    const failedEvents = [];

    // Get client IP
    const ipAddress = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                     '0.0.0.0';

    for (const eventData of events) {
      try {
        const {
          websiteId,
          eventType = 'page_view',
          url,
          referrer = '',
          userAgent,
          sessionId,
          userId = null,
          duration = 0,
          viewport,
          customData = {},
          timestamp
        } = eventData;

        // Verify website exists
        const website = await Website.findByWebsiteId(websiteId);
        if (!website) {
          failedEvents.push({ eventData, error: 'Website not found' });
          continue;
        }

        // Parse user agent
        const deviceInfo = parseUserAgent(userAgent);

        // Generate session ID if not provided
        const finalSessionId = sessionId || generateSessionId();

        // Sanitize URL
        const sanitizedUrl = sanitizeUrl(url);

        // Create event document
        const eventDoc = new Event({
          websiteId,
          eventType,
          url: sanitizedUrl,
          referrer: referrer || '',
          userAgent,
          ipAddress,
          sessionId: finalSessionId,
          userId,
          duration,
          viewport: viewport || { width: 0, height: 0 },
          device: {
            type: deviceInfo.device,
            os: deviceInfo.os,
            browser: deviceInfo.browser
          },
          customData,
          timestamp: timestamp ? new Date(timestamp) : new Date()
        });

        await eventDoc.save();
        processedEvents.push({
          eventId: eventDoc._id,
          sessionId: finalSessionId
        });

        // Check if this event completes any goals
        try {
          const Goal = require('../models/Goal');
          const completedGoals = await Goal.checkGoalCompletion(websiteId, {
            eventType,
            url: sanitizedUrl,
            referrer,
            duration,
            customData
          });

          // Record conversions for completed goals
          for (const goal of completedGoals) {
            await Goal.recordConversion({
              goal_id: goal.id,
              website_id: websiteId,
              session_id: finalSessionId,
              event_id: eventDoc._id.toString(),
              user_agent: userAgent,
              ip_address: ipAddress,
              referrer,
              page_url: sanitizedUrl,
              conversion_value: goal.value || 0,
              custom_data: customData
            });
            
            console.log(`🎯 Goal completed: ${goal.name} for website ${websiteId}`);
          }
        } catch (goalError) {
          console.error('Goal completion check error:', goalError);
          // Don't fail the event collection if goal checking fails
        }

      } catch (error) {
        failedEvents.push({ eventData, error: error.message });
      }
    }

    res.status(201).json({
      message: `Processed ${processedEvents.length} events successfully`,
      processedEvents,
      failedEvents,
      stats: {
        total: events.length,
        successful: processedEvents.length,
        failed: failedEvents.length
      }
    });

  } catch (error) {
    console.error('Batch event collection error:', error);
    res.status(500).json({ message: 'Failed to process batch events' });
  }
});

module.exports = router;