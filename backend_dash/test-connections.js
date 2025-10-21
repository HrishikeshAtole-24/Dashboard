const mongoose = require('mongoose');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Test MongoDB Atlas connection
async function testMongoDB() {
  console.log('🔄 Testing MongoDB Atlas connection...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📂 Collections found: ${collections.length}`);
    
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

// Test Neon PostgreSQL connection
async function testNeonDB() {
  console.log('\n🔄 Testing Neon PostgreSQL connection...');
  
  try {
    const sql = neon(process.env.NEON_DATABASE_URL);
    
    // Test connection with a simple query
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    
    console.log('✅ Neon PostgreSQL connected successfully!');
    console.log(`⏰ Current time: ${result[0].current_time}`);
    console.log(`🗄️ PostgreSQL version: ${result[0].pg_version.split(' ')[0]}`);
    
    // Test creating a simple table
    await sql`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Insert test data
    await sql`
      INSERT INTO connection_test (test_message) 
      VALUES ('Connection test successful!')
    `;
    
    // Read test data
    const testData = await sql`SELECT * FROM connection_test ORDER BY created_at DESC LIMIT 1`;
    console.log(`📝 Test data: ${testData[0].test_message}`);
    
    // Clean up
    await sql`DROP TABLE IF EXISTS connection_test`;
    console.log('🧹 Test table cleaned up');
    
  } catch (error) {
    console.error('❌ Neon PostgreSQL connection failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting database connection tests...\n');
  
  await testMongoDB();
  await testNeonDB();
  
  console.log('\n✨ Database connection tests completed!');
  process.exit(0);
}

runTests();