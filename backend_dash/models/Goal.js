const { getNeonDB } = require('../config/neon');

class Goal {
  static async createTable() {
    const { sql } = getNeonDB();
    
    // Create goals table
    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        website_id VARCHAR(50) NOT NULL,
        user_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        goal_type VARCHAR(50) NOT NULL DEFAULT 'url_destination',
        conditions JSONB NOT NULL DEFAULT '{}',
        value DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Create goal_conversions table for tracking individual conversions
    await sql`
      CREATE TABLE IF NOT EXISTS goal_conversions (
        id SERIAL PRIMARY KEY,
        goal_id INTEGER NOT NULL,
        website_id VARCHAR(50) NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        event_id VARCHAR(255),
        user_agent TEXT,
        ip_address VARCHAR(45),
        referrer TEXT,
        page_url TEXT NOT NULL,
        conversion_value DECIMAL(10,2) DEFAULT 0,
        custom_data JSONB DEFAULT '{}',
        converted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
      )
    `;

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_goals_website_id ON goals(website_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_goals_active ON goals(website_id, is_active)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_goal_conversions_goal_id ON goal_conversions(goal_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_goal_conversions_website_id ON goal_conversions(website_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_goal_conversions_session ON goal_conversions(session_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_goal_conversions_date ON goal_conversions(converted_at DESC)
    `;

    // Create trigger for updated_at
    await sql`
      DROP TRIGGER IF EXISTS update_goals_updated_at ON goals
    `;

    await sql`
      CREATE TRIGGER update_goals_updated_at 
        BEFORE UPDATE ON goals 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
  }

  static async create(goalData) {
    const { sql } = getNeonDB();
    const { 
      website_id, 
      user_id, 
      name, 
      description, 
      goal_type, 
      conditions, 
      value 
    } = goalData;
    
    const result = await sql`
      INSERT INTO goals (website_id, user_id, name, description, goal_type, conditions, value)
      VALUES (${website_id}, ${user_id}, ${name}, ${description || ''}, ${goal_type}, ${JSON.stringify(conditions)}, ${value || 0})
      RETURNING *
    `;
    
    return result[0];
  }

  static async findByWebsiteId(websiteId, userId) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      SELECT * FROM goals 
      WHERE website_id = ${websiteId} AND user_id = ${userId}
      ORDER BY created_at DESC
    `;
    
    return result.map(goal => ({
      ...goal,
      conditions: typeof goal.conditions === 'string' ? JSON.parse(goal.conditions) : goal.conditions
    }));
  }

  static async findById(goalId, userId) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      SELECT * FROM goals 
      WHERE id = ${goalId} AND user_id = ${userId}
    `;
    
    if (result.length === 0) {
      return null;
    }

    const goal = result[0];
    return {
      ...goal,
      conditions: typeof goal.conditions === 'string' ? JSON.parse(goal.conditions) : goal.conditions
    };
  }

  static async update(goalId, userId, updateData) {
    const { sql } = getNeonDB();
    const { name, description, goal_type, conditions, value, is_active } = updateData;
    
    const result = await sql`
      UPDATE goals 
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        goal_type = COALESCE(${goal_type}, goal_type),
        conditions = COALESCE(${conditions ? JSON.stringify(conditions) : null}, conditions),
        value = COALESCE(${value}, value),
        is_active = COALESCE(${is_active}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${goalId} AND user_id = ${userId}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return null;
    }

    const goal = result[0];
    return {
      ...goal,
      conditions: typeof goal.conditions === 'string' ? JSON.parse(goal.conditions) : goal.conditions
    };
  }

  static async delete(goalId, userId) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      DELETE FROM goals 
      WHERE id = ${goalId} AND user_id = ${userId}
      RETURNING *
    `;
    
    return result.length > 0;
  }

  static async recordConversion(conversionData) {
    const { sql } = getNeonDB();
    const {
      goal_id,
      website_id,
      session_id,
      event_id,
      user_agent,
      ip_address,
      referrer,
      page_url,
      conversion_value,
      custom_data
    } = conversionData;
    
    const result = await sql`
      INSERT INTO goal_conversions (
        goal_id, website_id, session_id, event_id, user_agent, 
        ip_address, referrer, page_url, conversion_value, custom_data
      )
      VALUES (
        ${goal_id}, ${website_id}, ${session_id}, ${event_id || null}, 
        ${user_agent || ''}, ${ip_address || ''}, ${referrer || ''}, 
        ${page_url}, ${conversion_value || 0}, ${JSON.stringify(custom_data || {})}
      )
      RETURNING *
    `;
    
    return result[0];
  }

  static async getConversions(goalId, userId, options = {}) {
    const { sql } = getNeonDB();
    const { startDate, endDate, limit = 100, offset = 0 } = options;
    
    try {
      let query;
      
      if (startDate && endDate) {
        query = sql`
          SELECT gc.*, g.name as goal_name, g.value as goal_value
          FROM goal_conversions gc
          JOIN goals g ON gc.goal_id = g.id
          WHERE g.id = ${goalId} AND g.user_id = ${userId}
            AND gc.converted_at >= ${startDate}
            AND gc.converted_at <= ${endDate}
          ORDER BY gc.converted_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (startDate) {
        query = sql`
          SELECT gc.*, g.name as goal_name, g.value as goal_value
          FROM goal_conversions gc
          JOIN goals g ON gc.goal_id = g.id
          WHERE g.id = ${goalId} AND g.user_id = ${userId}
            AND gc.converted_at >= ${startDate}
          ORDER BY gc.converted_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (endDate) {
        query = sql`
          SELECT gc.*, g.name as goal_name, g.value as goal_value
          FROM goal_conversions gc
          JOIN goals g ON gc.goal_id = g.id
          WHERE g.id = ${goalId} AND g.user_id = ${userId}
            AND gc.converted_at <= ${endDate}
          ORDER BY gc.converted_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        query = sql`
          SELECT gc.*, g.name as goal_name, g.value as goal_value
          FROM goal_conversions gc
          JOIN goals g ON gc.goal_id = g.id
          WHERE g.id = ${goalId} AND g.user_id = ${userId}
          ORDER BY gc.converted_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }
      
      const result = await query;
      
      return result.map(conversion => ({
        ...conversion,
        custom_data: typeof conversion.custom_data === 'string' 
          ? JSON.parse(conversion.custom_data) 
          : conversion.custom_data
      }));
    } catch (error) {
      console.error('Error in getConversions:', error);
      // Return empty array if table doesn't exist or no conversions
      return [];
    }
  }

  static async getConversionStats(goalId, userId, options = {}) {
    const { sql } = getNeonDB();
    const { startDate, endDate } = options;
    
    try {
      let query;
      
      if (startDate && endDate) {
        query = sql`
          SELECT 
            COUNT(*) as total_conversions,
            SUM(gc.conversion_value) as total_value,
            AVG(gc.conversion_value) as avg_value,
            COUNT(DISTINCT gc.session_id) as unique_sessions,
            DATE(gc.converted_at) as conversion_date
          FROM goal_conversions gc
          JOIN goals g ON gc.goal_id = g.id
          WHERE g.id = ${goalId} AND g.user_id = ${userId}
            AND gc.converted_at >= ${startDate}
            AND gc.converted_at <= ${endDate}
          GROUP BY DATE(gc.converted_at)
          ORDER BY conversion_date DESC
        `;
      } else if (startDate) {
        query = sql`
          SELECT 
            COUNT(*) as total_conversions,
            SUM(gc.conversion_value) as total_value,
            AVG(gc.conversion_value) as avg_value,
            COUNT(DISTINCT gc.session_id) as unique_sessions,
            DATE(gc.converted_at) as conversion_date
          FROM goal_conversions gc
          JOIN goals g ON gc.goal_id = g.id
          WHERE g.id = ${goalId} AND g.user_id = ${userId}
            AND gc.converted_at >= ${startDate}
          GROUP BY DATE(gc.converted_at)
          ORDER BY conversion_date DESC
        `;
      } else if (endDate) {
        query = sql`
          SELECT 
            COUNT(*) as total_conversions,
            SUM(gc.conversion_value) as total_value,
            AVG(gc.conversion_value) as avg_value,
            COUNT(DISTINCT gc.session_id) as unique_sessions,
            DATE(gc.converted_at) as conversion_date
          FROM goal_conversions gc
          JOIN goals g ON gc.goal_id = g.id
          WHERE g.id = ${goalId} AND g.user_id = ${userId}
            AND gc.converted_at <= ${endDate}
          GROUP BY DATE(gc.converted_at)
          ORDER BY conversion_date DESC
        `;
      } else {
        query = sql`
          SELECT 
            COUNT(*) as total_conversions,
            SUM(gc.conversion_value) as total_value,
            AVG(gc.conversion_value) as avg_value,
            COUNT(DISTINCT gc.session_id) as unique_sessions,
            DATE(gc.converted_at) as conversion_date
          FROM goal_conversions gc
          JOIN goals g ON gc.goal_id = g.id
          WHERE g.id = ${goalId} AND g.user_id = ${userId}
          GROUP BY DATE(gc.converted_at)
          ORDER BY conversion_date DESC
        `;
      }
      
      const result = await query;
      return result.length > 0 ? result : [];
    } catch (error) {
      console.error('Error in getConversionStats:', error);
      // Return empty stats if table doesn't exist or no conversions
      return [];
    }
  }

  static async getConversionRates(websiteId, userId, options = {}) {
    const { sql } = getNeonDB();
    const { startDate, endDate, goalId } = options;
    
    try {
      // Connect to MongoDB to get session data
      const mongoose = require('mongoose');
      const Event = require('./Event');
      
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
      }
      
      // Get total unique sessions from MongoDB for the time period
      let sessionFilter = { websiteId: websiteId };
      
      if (startDate && endDate) {
        sessionFilter.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      } else if (startDate) {
        sessionFilter.timestamp = { $gte: new Date(startDate) };
      } else if (endDate) {
        sessionFilter.timestamp = { $lte: new Date(endDate) };
      }
      
      const uniqueSessions = await Event.distinct('sessionId', sessionFilter);
      const totalSessions = uniqueSessions.length;
      
      // Get basic goals data first
      let baseGoalsQuery;
      if (goalId) {
        baseGoalsQuery = sql`
          SELECT id, name, goal_type, created_at
          FROM goals
          WHERE website_id = ${websiteId} AND user_id = ${userId} AND is_active = true AND id = ${goalId}
        `;
      } else {
        baseGoalsQuery = sql`
          SELECT id, name, goal_type, created_at
          FROM goals
          WHERE website_id = ${websiteId} AND user_id = ${userId} AND is_active = true
        `;
      }
      
      const goalsResult = await baseGoalsQuery;
      
      // For each goal, get conversion data
      const conversionsData = await Promise.all(goalsResult.map(async (goal) => {
        let conversionQuery;
        
        if (startDate && endDate) {
          conversionQuery = sql`
            SELECT 
              COUNT(gc.id) as conversions,
              COUNT(DISTINCT gc.session_id) as converting_sessions,
              COALESCE(SUM(gc.conversion_value), 0) as total_value
            FROM goal_conversions gc
            WHERE gc.goal_id = ${goal.id}
              AND gc.converted_at >= ${startDate}
              AND gc.converted_at <= ${endDate}
          `;
        } else if (startDate) {
          conversionQuery = sql`
            SELECT 
              COUNT(gc.id) as conversions,
              COUNT(DISTINCT gc.session_id) as converting_sessions,
              COALESCE(SUM(gc.conversion_value), 0) as total_value
            FROM goal_conversions gc
            WHERE gc.goal_id = ${goal.id}
              AND gc.converted_at >= ${startDate}
          `;
        } else if (endDate) {
          conversionQuery = sql`
            SELECT 
              COUNT(gc.id) as conversions,
              COUNT(DISTINCT gc.session_id) as converting_sessions,
              COALESCE(SUM(gc.conversion_value), 0) as total_value
            FROM goal_conversions gc
            WHERE gc.goal_id = ${goal.id}
              AND gc.converted_at <= ${endDate}
          `;
        } else {
          conversionQuery = sql`
            SELECT 
              COUNT(gc.id) as conversions,
              COUNT(DISTINCT gc.session_id) as converting_sessions,
              COALESCE(SUM(gc.conversion_value), 0) as total_value
            FROM goal_conversions gc
            WHERE gc.goal_id = ${goal.id}
          `;
        }
        
        const conversionResult = await conversionQuery;
        const conversion = conversionResult[0] || { conversions: 0, converting_sessions: 0, total_value: 0 };
        
        return {
          goal_id: goal.id,
          goal_name: goal.name,
          conversions: parseInt(conversion.conversions),
          converting_sessions: parseInt(conversion.converting_sessions),
          total_value: parseFloat(conversion.total_value),
          conversion_rate: totalSessions > 0 ? (parseInt(conversion.converting_sessions) / totalSessions * 100).toFixed(2) : '0.00',
          total_sessions: totalSessions
        };
      }));
      
      return conversionsData.sort((a, b) => b.conversions - a.conversions);
      
    } catch (error) {
      console.error('Error in getConversionRates:', error);
      throw error;
    }
  }

  // Check if a given event matches any goal conditions
  static async checkGoalCompletion(websiteId, eventData) {
    const { sql } = getNeonDB();
    
    console.log('🔍 Checking goal completion for:', {
      websiteId,
      eventType: eventData.eventType,
      customData: eventData.customData
    });
    
    // Get all active goals for this website
    const goals = await sql`
      SELECT * FROM goals 
      WHERE website_id = ${websiteId} AND is_active = true
    `;
    
    console.log(`📋 Found ${goals.length} active goals for website ${websiteId}`);
    
    const completedGoals = [];
    
    for (const goal of goals) {
      const conditions = typeof goal.conditions === 'string' 
        ? JSON.parse(goal.conditions) 
        : goal.conditions;
      
      let isCompleted = false;
      
      switch (goal.goal_type) {
        case 'url_destination':
          if (conditions.url && eventData.url) {
            if (conditions.match_type === 'exact') {
              isCompleted = eventData.url === conditions.url;
            } else if (conditions.match_type === 'contains') {
              isCompleted = eventData.url.includes(conditions.url);
            } else if (conditions.match_type === 'regex') {
              const regex = new RegExp(conditions.url);
              isCompleted = regex.test(eventData.url);
            }
          }
          break;
          
        case 'event':
          if (conditions.event_type && eventData.eventType) {
            isCompleted = eventData.eventType === conditions.event_type;
            
            // Additional custom data matching if specified
            if (isCompleted && conditions.custom_data) {
              for (const [key, value] of Object.entries(conditions.custom_data)) {
                if (!eventData.customData || eventData.customData[key] !== value) {
                  isCompleted = false;
                  break;
                }
              }
            }
          }
          break;
          
        case 'page_duration':
          if (conditions.duration && eventData.duration) {
            isCompleted = eventData.duration >= conditions.duration;
          }
          break;
          
        case 'click':
          if (eventData.eventType === 'click') {
            // Check if href matches (for download links)
            if (conditions.href && eventData.customData && eventData.customData.href) {
              if (conditions.match_type === 'exact') {
                isCompleted = eventData.customData.href === conditions.href;
              } else if (conditions.match_type === 'contains') {
                isCompleted = eventData.customData.href.includes(conditions.href);
              } else if (conditions.match_type === 'regex') {
                const regex = new RegExp(conditions.href);
                isCompleted = regex.test(eventData.customData.href);
              } else {
                // Default to contains if no match_type specified
                isCompleted = eventData.customData.href.includes(conditions.href);
              }
            }
            
            // Check if element text matches
            if (conditions.text && eventData.customData && eventData.customData.text) {
              if (conditions.match_type === 'exact') {
                isCompleted = eventData.customData.text === conditions.text;
              } else if (conditions.match_type === 'contains') {
                isCompleted = eventData.customData.text.toLowerCase().includes(conditions.text.toLowerCase());
              } else if (conditions.match_type === 'regex') {
                const regex = new RegExp(conditions.text, 'i');
                isCompleted = regex.test(eventData.customData.text);
              } else {
                // Default to contains if no match_type specified
                isCompleted = eventData.customData.text.toLowerCase().includes(conditions.text.toLowerCase());
              }
            }
          }
          break;
          
        case 'download':
          if (eventData.eventType === 'download') {
            let fileUrlMatch = false;
            let fileNameMatch = false;
            let fileTypeMatch = false;
            
            // Check if file URL matches
            if (conditions.fileUrl && eventData.customData && eventData.customData.fileUrl) {
              if (conditions.match_type === 'exact') {
                fileUrlMatch = eventData.customData.fileUrl === conditions.fileUrl;
              } else if (conditions.match_type === 'contains') {
                fileUrlMatch = eventData.customData.fileUrl.includes(conditions.fileUrl);
              } else if (conditions.match_type === 'regex') {
                const regex = new RegExp(conditions.fileUrl);
                fileUrlMatch = regex.test(eventData.customData.fileUrl);
              } else {
                // Default to contains if no match_type specified
                fileUrlMatch = eventData.customData.fileUrl.includes(conditions.fileUrl);
              }
            }
            
            // Check if file name matches
            if (conditions.fileName && eventData.customData && eventData.customData.fileName) {
              if (conditions.match_type === 'exact') {
                fileNameMatch = eventData.customData.fileName === conditions.fileName;
              } else if (conditions.match_type === 'contains') {
                fileNameMatch = eventData.customData.fileName.toLowerCase().includes(conditions.fileName.toLowerCase());
              } else if (conditions.match_type === 'regex') {
                const regex = new RegExp(conditions.fileName, 'i');
                fileNameMatch = regex.test(eventData.customData.fileName);
              } else {
                // Default to contains if no match_type specified
                fileNameMatch = eventData.customData.fileName.toLowerCase().includes(conditions.fileName.toLowerCase());
              }
            }
            
            // Check if file type matches
            if (conditions.fileType && eventData.customData && eventData.customData.fileType) {
              fileTypeMatch = eventData.customData.fileType.toLowerCase() === conditions.fileType.toLowerCase();
            }
            
            // If no conditions are set, match any download
            if (!conditions.fileUrl && !conditions.fileName && !conditions.fileType) {
              isCompleted = true;
            } else {
              // If any condition is set and matches, goal is completed
              isCompleted = fileUrlMatch || fileNameMatch || fileTypeMatch;
            }
          }
          break;
      }
      
      if (isCompleted) {
        console.log(`✅ Goal completed: "${goal.name}" (${goal.goal_type})`);
        completedGoals.push(goal);
      } else {
        console.log(`❌ Goal not completed: "${goal.name}" (${goal.goal_type})`);
        console.log(`   Conditions: ${JSON.stringify(conditions)}`);
        console.log(`   Event data: ${JSON.stringify(eventData)}`);
      }
    }
    
    console.log(`🎯 Total goals completed: ${completedGoals.length}`);
    return completedGoals;
  }
}

module.exports = Goal;