const { getNeonDB } = require('../config/neon');

class DailyStats {
  static async createTable() {
    const { sql } = getNeonDB();
    
    await sql`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id SERIAL PRIMARY KEY,
        website_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        total_visits INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        avg_duration FLOAT DEFAULT 0,
        bounce_rate FLOAT DEFAULT 0,
        top_page VARCHAR(500),
        top_referrer VARCHAR(500),
        top_country VARCHAR(100),
        device_stats JSONB DEFAULT '{}',
        browser_stats JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(website_id, date)
      )
    `;

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_daily_stats_website_date ON daily_stats(website_id, date DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC)
    `;

    // Create trigger for updated_at
    await sql`
      DROP TRIGGER IF EXISTS update_daily_stats_updated_at ON daily_stats
    `;

    await sql`
      CREATE TRIGGER update_daily_stats_updated_at 
        BEFORE UPDATE ON daily_stats 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
  }

  static async upsert(statsData) {
    const { sql } = getNeonDB();
    const {
      website_id,
      date,
      total_visits,
      unique_visitors,
      page_views,
      avg_duration,
      bounce_rate,
      top_page,
      top_referrer,
      top_country,
      device_stats,
      browser_stats
    } = statsData;
    
    const result = await sql`
      INSERT INTO daily_stats (
        website_id, date, total_visits, unique_visitors, page_views,
        avg_duration, bounce_rate, top_page, top_referrer, top_country,
        device_stats, browser_stats
      )
      VALUES (
        ${website_id}, ${date}, ${total_visits}, ${unique_visitors}, ${page_views},
        ${avg_duration}, ${bounce_rate}, ${top_page}, ${top_referrer}, ${top_country},
        ${JSON.stringify(device_stats)}, ${JSON.stringify(browser_stats)}
      )
      ON CONFLICT (website_id, date) 
      DO UPDATE SET
        total_visits = EXCLUDED.total_visits,
        unique_visitors = EXCLUDED.unique_visitors,
        page_views = EXCLUDED.page_views,
        avg_duration = EXCLUDED.avg_duration,
        bounce_rate = EXCLUDED.bounce_rate,
        top_page = EXCLUDED.top_page,
        top_referrer = EXCLUDED.top_referrer,
        top_country = EXCLUDED.top_country,
        device_stats = EXCLUDED.device_stats,
        browser_stats = EXCLUDED.browser_stats,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    return result[0];
  }

  static async findByWebsiteId(websiteId, startDate, endDate, limit = 30) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      SELECT * FROM daily_stats 
      WHERE website_id = ${websiteId}
        AND date >= ${startDate}
        AND date <= ${endDate}
      ORDER BY date DESC
      LIMIT ${limit}
    `;
    
    return result;
  }

  static async getOverviewStats(websiteId, days = 30) {
    const { sql } = getNeonDB();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const result = await sql`
      SELECT 
        SUM(total_visits) as total_visits,
        SUM(unique_visitors) as unique_visitors,
        SUM(page_views) as total_page_views,
        AVG(avg_duration) as avg_duration,
        AVG(bounce_rate) as avg_bounce_rate,
        COUNT(*) as days_with_data
      FROM daily_stats 
      WHERE website_id = ${websiteId}
        AND date >= ${startDate.toISOString().split('T')[0]}
        AND date <= ${endDate.toISOString().split('T')[0]}
    `;
    
    return result[0];
  }

  static async getTopPages(websiteId, days = 30) {
    const { sql } = getNeonDB();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const result = await sql`
      SELECT 
        top_page,
        SUM(total_visits) as visits
      FROM daily_stats 
      WHERE website_id = ${websiteId}
        AND date >= ${startDate.toISOString().split('T')[0]}
        AND date <= ${endDate.toISOString().split('T')[0]}
        AND top_page IS NOT NULL
      GROUP BY top_page
      ORDER BY visits DESC
      LIMIT 10
    `;
    
    return result;
  }

  static async getChartData(websiteId, days = 30) {
    const { sql } = getNeonDB();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const result = await sql`
      SELECT 
        date,
        total_visits,
        unique_visitors,
        page_views,
        avg_duration,
        bounce_rate
      FROM daily_stats 
      WHERE website_id = ${websiteId}
        AND date >= ${startDate.toISOString().split('T')[0]}
        AND date <= ${endDate.toISOString().split('T')[0]}
      ORDER BY date ASC
    `;
    
    return result;
  }
}

module.exports = DailyStats;