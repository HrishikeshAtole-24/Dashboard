require('dotenv').config();
const { connectNeonDB } = require('./config/neon');

async function testDatabaseConnection() {
  try {
    console.log('Environment variable loaded:', !!process.env.NEON_DATABASE_URL);
    console.log('Testing Neon database connection...');
    await connectNeonDB();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const { getNeonDB } = require('./config/neon');
    const { sql } = getNeonDB();
    
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('This might be a temporary network issue or Neon database timeout');
    process.exit(1);
  }
}

testDatabaseConnection();