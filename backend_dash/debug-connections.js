const https = require('https');
const mongoose = require('mongoose');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Get current public IP
function getCurrentIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.ip);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function runDetailedTests() {
  console.log('🔍 Getting your current IP address...');
  
  try {
    const currentIP = await getCurrentIP();
    console.log(`📍 Your current public IP: ${currentIP}`);
    console.log(`💡 Add this IP to MongoDB Atlas Network Access: ${currentIP}/32`);
  } catch (error) {
    console.log('❌ Could not get IP address:', error.message);
  }

  console.log('\n🔄 Testing MongoDB Atlas connection...');
  console.log(`🔗 Connection string: ${process.env.MONGODB_URI?.replace(/:[^:@]*@/, ':***@')}`);
  
  try {
    console.log('⏳ Attempting MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('IP')) {
      console.log('\n💡 MongoDB Atlas IP Whitelist Steps:');
      console.log('   1. Go to https://cloud.mongodb.com/');
      console.log('   2. Select your project/cluster');
      console.log('   3. Go to Security → Network Access');
      console.log('   4. Click "Add IP Address"');
      console.log(`   5. Add your IP: ${await getCurrentIP().catch(() => 'YOUR_IP')}`);
      console.log('   6. Or use 0.0.0.0/0 for testing (less secure)');
    }
  }

  console.log('\n🔄 Testing Neon PostgreSQL connection...');
  console.log(`🔗 Connection string: ${process.env.NEON_DATABASE_URL?.replace(/:[^:@]*@/, ':***@')}`);
  
  try {
    console.log('⏳ Attempting Neon connection...');
    const sql = neon(process.env.NEON_DATABASE_URL);
    
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    
    console.log('✅ Neon PostgreSQL connected successfully!');
    console.log(`⏰ Current time: ${result[0].current_time}`);
    console.log(`🗄️ PostgreSQL version: ${result[0].pg_version.split(' ')[0]}`);
    
  } catch (error) {
    console.error('❌ Neon PostgreSQL connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'Unknown'}`);
    
    console.log('\n💡 Neon PostgreSQL Troubleshooting:');
    console.log('   1. Check if the connection string is correct');
    console.log('   2. Verify the database exists in Neon dashboard');
    console.log('   3. Check if the user has proper permissions');
    console.log('   4. Try connecting from Neon SQL Editor first');
  }

  console.log('\n✨ Detailed connection tests completed!');
  process.exit(0);
}

runDetailedTests();