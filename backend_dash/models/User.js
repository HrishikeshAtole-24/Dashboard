const { getNeonDB } = require('../config/neon');

class User {
  static async createTable() {
    const { sql } = getNeonDB();
    
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create trigger for updated_at
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users
    `;

    await sql`
      CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;
  }

  static async create(userData) {
    const { sql } = getNeonDB();
    const { email, password_hash, first_name, last_name } = userData;
    
    const result = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES (${email}, ${password_hash}, ${first_name}, ${last_name})
      RETURNING id, email, first_name, last_name, is_active, created_at
    `;
    
    return result[0];
  }

  static async findByEmail(email) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} AND is_active = true
    `;
    
    return result[0] || null;
  }

  static async findById(id) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      SELECT id, email, first_name, last_name, is_active, created_at, updated_at 
      FROM users WHERE id = ${id} AND is_active = true
    `;
    
    return result[0] || null;
  }

  static async updateById(id, updateData) {
    const { sql } = getNeonDB();
    const { first_name, last_name } = updateData;
    
    const result = await sql`
      UPDATE users 
      SET first_name = ${first_name}, last_name = ${last_name}
      WHERE id = ${id} AND is_active = true
      RETURNING id, email, first_name, last_name, is_active, created_at, updated_at
    `;
    
    return result[0] || null;
  }

  static async deactivate(id) {
    const { sql } = getNeonDB();
    
    const result = await sql`
      UPDATE users 
      SET is_active = false
      WHERE id = ${id}
      RETURNING id, email, is_active
    `;
    
    return result[0] || null;
  }
}

module.exports = User;