const { connectNeonDB, getNeonDB } = require('./config/neon');

async function checkGoalsOnly() {
  try {
    console.log('🔍 Checking Goals Configuration...\n');
    
    // Connect to database first
    await connectNeonDB();
    const { sql } = getNeonDB();
    
    // Check current goals
    const goals = await sql`
      SELECT id, name, goal_type, conditions, value, is_active, created_at
      FROM goals 
      WHERE website_id = 'web_mh0j26qzc224338g7lt'
      ORDER BY created_at DESC
    `;
    
    console.log('📋 Current Goals:');
    if (goals.length === 0) {
      console.log('❌ No goals found for your portfolio website!');
      console.log('💡 You need to create a resume download goal first.');
    } else {
      goals.forEach((goal, index) => {
        console.log(`${index + 1}. Goal: "${goal.name}"`);
        console.log(`   Type: ${goal.goal_type}`);
        console.log(`   Conditions: ${goal.conditions}`);
        console.log(`   Value: ${goal.value}`);
        console.log(`   Active: ${goal.is_active}`);
        console.log(`   Created: ${goal.created_at}\n`);
      });
    }
    
    // Check goal conversions
    console.log('🎯 Goal Conversions:');
    const conversions = await sql`
      SELECT gc.*, g.name as goal_name
      FROM goal_conversions gc
      JOIN goals g ON gc.goal_id = g.id
      WHERE gc.website_id = 'web_mh0j26qzc224338g7lt'
      ORDER BY gc.converted_at DESC
      LIMIT 10
    `;
    
    if (conversions.length === 0) {
      console.log('❌ No conversions recorded yet!');
      console.log('💡 This means no goals have been completed.');
    } else {
      console.log(`✅ Found ${conversions.length} conversions:`);
      conversions.forEach((conv, index) => {
        console.log(`${index + 1}. ${conv.goal_name} - ${conv.converted_at}`);
        console.log(`   Session: ${conv.session_id}`);
        console.log(`   Page: ${conv.page_url}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkGoalsOnly();