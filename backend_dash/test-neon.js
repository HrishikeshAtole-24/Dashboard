const { Pool } = require('pg');
require('dotenv').config();

async function testNeonWithPg() {
  console.log('🔄 Testing Neon PostgreSQL with pg Pool...');
  
  const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL with pg Pool!');
    
    const result = await client.query('SELECT NOW()');
    console.log(`⏰ Current time: ${result.rows[0].now}`);
    
    client.release();
    await pool.end();
    
    console.log('✅ Neon PostgreSQL test with pg Pool successful!');
  } catch (error) {
    console.error('❌ Neon PostgreSQL pg Pool test failed:', error.message);
    console.error('Full error:', error);
  }
}

testNeonWithPg();