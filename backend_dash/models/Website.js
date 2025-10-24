const { getNeonDB } = require('../config/neon');

class Website {
  static async createTable() {
    const { sql } = getNeonDB();
    
    await sql`
      CREATE TABLE IF NOT EXISTS websites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        domain VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        website_id VARCHAR(50) UNIQUE NOT NULL, -- This will be used in tracking script
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index on website_id for fast lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_websites_website_id ON websites(website_id)
    `;

    // Create index on user_id
    await sql`
      CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id)
    `;

    // Create trigger for updated_at
    await sql`
      DROP TRIGGER IF EXISTS update_websites_updated_at ON websites
    `;

    await sql`
      CREATE TRIGGER update_websites_updated_at 
        BEFORE UPDATE ON websites 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
  }

  static async create(websiteData) {
    const { sql } = getNeonDB();
    const { user_id, domain, name, description, website_id } = websiteData;
    
    const result = await sql`
      INSERT INTO websites (user_id, domain, name, description, website_id)
      VALUES (${user_id}, ${domain}, ${name}, ${description}, ${website_id})
      RETURNING *
    `;
    
    return result[0];
  }

  static async findByUserId(userId) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      SELECT * FROM websites 
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY created_at DESC
    `;
    
    return result;
  }

  static async findByWebsiteId(websiteId) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      SELECT * FROM websites 
      WHERE website_id = ${websiteId} AND is_active = true
    `;
    
    return result[0] || null;
  }

  static async findById(id) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      SELECT * FROM websites 
      WHERE id = ${id} AND is_active = true
    `;
    
    return result[0] || null;
  }

  static async updateById(id, updateData) {
    const { sql } = getNeonDB();
    const { domain, name, description } = updateData;
    
    const result = await sql`
      UPDATE websites 
      SET domain = ${domain}, name = ${name}, description = ${description}
      WHERE id = ${id} AND is_active = true
      RETURNING *
    `;
    
    return result[0] || null;
  }

  static async deactivate(id) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      UPDATE websites 
      SET is_active = false
      WHERE id = ${id}
      RETURNING id, domain, name, is_active
    `;
    
    return result[0] || null;
  }

  static async checkOwnership(websiteId, userId) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      SELECT id FROM websites 
      WHERE website_id = ${websiteId} AND user_id = ${userId} AND is_active = true
    `;
    
    return result.length > 0;
  }

  // Get all registered domains for CORS checking
  static async getAllDomains() {
    const { sql } = getNeonDB();
    
    const result = await sql`
      SELECT DISTINCT domain FROM websites 
      WHERE is_active = true AND domain IS NOT NULL AND domain != ''
    `;
    
    return result;
  }

  // Get all websites (for seeding data)
  static async getAll() {
    const { sql } = getNeonDB();
    
    const result = await sql`
      SELECT * FROM websites 
      WHERE is_active = true
      ORDER BY created_at DESC
    `;
    
    return result;
  }
}

module.exports = Website;