require('dotenv').config();
const { connectNeonDB } = require('./config/neon');

async function checkTables() {
  try {
    console.log('Connecting to database...');
    await connectNeonDB();
    
    const { getNeonDB } = require('./config/neon');
    const { sql } = getNeonDB();
    
    console.log('Checking existing tables...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('Available tables:', tables.map(t => t.table_name));
    
    // Check if goals and goal_conversions tables exist
    const goalTables = tables.filter(t => t.table_name.includes('goal'));
    console.log('Goal-related tables:', goalTables.map(t => t.table_name));
    
    // Check goals table structure
    if (goalTables.find(t => t.table_name === 'goals')) {
      const goals = await sql`SELECT * FROM goals LIMIT 5`;
      console.log('Sample goals:', goals);
    }
    
    // Check conversions table structure
    if (goalTables.find(t => t.table_name === 'goal_conversions')) {
      const conversions = await sql`SELECT * FROM goal_conversions LIMIT 5`;
      console.log('Sample conversions:', conversions);
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  } finally {
    process.exit(0);
  }
}

checkTables();