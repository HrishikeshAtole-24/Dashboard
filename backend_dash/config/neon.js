const { neon } = require('@neondatabase/serverless');
const { Pool } = require('pg');

let sql;
let pool;

const connectNeonDB = async () => {
  try {
    // Initialize Neon serverless connection
    sql = neon(process.env.NEON_DATABASE_URL);
    
    // Test the connection
    const result = await sql`SELECT NOW()`;
    console.log('Neon DB connection test successful:', result[0].now);

    // Also create a pool for complex queries
    pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: true
    });

    // Test pool connection
    const client = await pool.connect();
    client.release();
    
    console.log('Neon DB pool connection successful');

    return { sql, pool };
  } catch (error) {
    console.error('Error connecting to Neon DB:', error.message);
    process.exit(1);
  }
};

// Export both sql function and pool
const getNeonDB = () => {
  if (!sql) {
    throw new Error('Neon DB not initialized. Call connectNeonDB first.');
  }
  return { sql, pool };
};

module.exports = {
  connectNeonDB,
  getNeonDB
};