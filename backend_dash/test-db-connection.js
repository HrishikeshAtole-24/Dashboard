require('dotenv').config();
const { connectNeonDB } = require('./config/neon');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await connectNeonDB();
    console.log('✅ Database connection successful!');
    
    const { getNeonDB } = require('./config/neon');
    const { sql } = getNeonDB();
    
    // Test query
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database query successful:', result[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();