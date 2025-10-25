const cron = require('node-cron');
const Event = require('../models/Event');
const DailyStats = require('../models/DailyStats');
const { calculateBounceRate } = require('../utils/helpers');
const { batchProcessGoalCompletions } = require('../batch-process-goals');

class AggregationJob {
  constructor() {
    this.job = null;
    this.isRunning = false;
  }

  start() {
    // Run every day at 1:00 AM
    this.job = cron.schedule('0 1 * * *', async () => {
      await this.runAggregation();
    }, {
      scheduled: false,
      timezone: "UTC"
    });

    this.job.start();
    console.log('📊 Aggregation cron job scheduled to run daily at 1:00 AM UTC');

    // Also run aggregation for yesterday on startup (if not already done)
    setTimeout(() => {
      this.runAggregation();
    }, 5000);
  }

  stop() {
    if (this.job) {
      this.job.stop();
      console.log('📊 Aggregation cron job stopped');
    }
  }

  async runAggregation(targetDate = null) {
    if (this.isRunning) {
      console.log('📊 Aggregation already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('📊 Starting data aggregation...');

    try {
      // Default to yesterday if no date specified
      const date = targetDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      console.log(`📊 Aggregating data for ${dateStr}`);

      // Get all unique websites that had events on this date
      const websitesWithEvents = await Event.distinct('websiteId', {
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      });

      console.log(`📊 Found ${websitesWithEvents.length} websites with events`);

      for (const websiteId of websitesWithEvents) {
        await this.aggregateWebsiteData(websiteId, dateStr, startOfDay, endOfDay);
      }

      console.log(`📊 Aggregation completed for ${dateStr}`);
      
      // Process goal completions for all websites
      console.log('🎯 Processing goal completions...');
      await batchProcessGoalCompletions();
      
    } catch (error) {
      console.error('📊 Aggregation error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async aggregateWebsiteData(websiteId, dateStr, startOfDay, endOfDay) {
    try {
      // Get all events for this website on this date
      const events = await Event.find({
        websiteId,
        timestamp: { $gte: startOfDay, $lte: endOfDay }
      });

      if (events.length === 0) {
        return;
      }

      // Calculate metrics
      const totalVisits = events.filter(e => e.eventType === 'page_view').length;
      const uniqueVisitors = new Set(events.map(e => e.sessionId)).size;
      const pageViews = events.length;

      // Calculate average duration
      const durationsSum = events.reduce((sum, e) => sum + (e.duration || 0), 0);
      const avgDuration = totalVisits > 0 ? durationsSum / totalVisits : 0;

      // Calculate bounce rate (sessions with only 1 page view)
      const sessionEventCounts = {};
      events.forEach(event => {
        if (event.eventType === 'page_view') {
          sessionEventCounts[event.sessionId] = (sessionEventCounts[event.sessionId] || 0) + 1;
        }
      });
      
      const totalSessions = Object.keys(sessionEventCounts).length;
      const bouncedSessions = Object.values(sessionEventCounts).filter(count => count === 1).length;
      const bounceRate = calculateBounceRate(totalSessions, bouncedSessions);

      // Find top page
      const pageCounts = {};
      events.filter(e => e.eventType === 'page_view').forEach(event => {
        pageCounts[event.url] = (pageCounts[event.url] || 0) + 1;
      });
      const topPage = Object.keys(pageCounts).reduce((a, b) => 
        pageCounts[a] > pageCounts[b] ? a : b, '');

      // Find top referrer
      const referrerCounts = {};
      events.filter(e => e.referrer && e.referrer !== '').forEach(event => {
        const domain = this.extractDomain(event.referrer);
        referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
      });
      const topReferrer = Object.keys(referrerCounts).length > 0 
        ? Object.keys(referrerCounts).reduce((a, b) => 
            referrerCounts[a] > referrerCounts[b] ? a : b, '')
        : '';

      // Aggregate device stats
      const deviceStats = {};
      events.forEach(event => {
        const deviceType = event.device?.type || 'unknown';
        deviceStats[deviceType] = (deviceStats[deviceType] || 0) + 1;
      });

      // Aggregate browser stats
      const browserStats = {};
      events.forEach(event => {
        const browser = event.device?.browser || 'unknown';
        browserStats[browser] = (browserStats[browser] || 0) + 1;
      });

      // Get top country (would need to implement geolocation)
      const topCountry = 'Unknown'; // Placeholder for now

      // Upsert daily stats
      const statsData = {
        website_id: websiteId,
        date: dateStr,
        total_visits: totalVisits,
        unique_visitors: uniqueVisitors,
        page_views: pageViews,
        avg_duration: avgDuration,
        bounce_rate: bounceRate,
        top_page: topPage,
        top_referrer: topReferrer,
        top_country: topCountry,
        device_stats: deviceStats,
        browser_stats: browserStats
      };

      await DailyStats.upsert(statsData);
      
      console.log(`📊 Aggregated data for website ${websiteId}: ${totalVisits} visits, ${uniqueVisitors} unique visitors`);

    } catch (error) {
      console.error(`📊 Error aggregating data for website ${websiteId}:`, error);
    }
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return url;
    }
  }

  // Manual trigger for testing
  async runManual(date = null) {
    console.log('📊 Running manual aggregation...');
    await this.runAggregation(date);
  }
}

const aggregationJob = new AggregationJob();

module.exports = aggregationJob;