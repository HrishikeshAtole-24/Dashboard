const { connectNeonDB } = require('./config/neon');
const connectMongoDB = require('./config/mongo');
const Goal = require('./models/Goal');
const Event = require('./models/Event');

// Batch process events for goal completion (Global Analytics Product Solution)
async function batchProcessGoalCompletions() {
  try {
    console.log('🚀 Global Analytics: Batch Processing Goal Completions...\n');
    
    // Connect to databases
    await connectNeonDB();
    await connectMongoDB();
    
    // Get all websites with goals
    const { sql } = await import('./config/neon.js').then(m => m.getNeonDB());
    
    const websitesWithGoals = await sql`
      SELECT DISTINCT website_id FROM goals WHERE is_active = true
    `;
    
    console.log(`📊 Found ${websitesWithGoals.length} websites with active goals`);
    
    let totalConversions = 0;
    
    for (const { website_id } of websitesWithGoals) {
      console.log(`\n🔍 Processing website: ${website_id}`);
      
      // Get unprocessed events (events without conversions)
      const unprocessedEvents = await Event.find({
        websiteId: website_id,
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).sort({ timestamp: -1 });
      
      console.log(`   📋 Found ${unprocessedEvents.length} recent events`);
      
      for (const event of unprocessedEvents) {
        const eventData = {
          eventType: event.eventType,
          url: event.url,
          referrer: event.referrer,
          duration: event.duration,
          customData: event.customData
        };
        
        const completedGoals = await Goal.checkGoalCompletion(website_id, eventData);
        
        for (const goal of completedGoals) {
          // Check if conversion already exists to avoid duplicates
          const existingConversion = await sql`
            SELECT id FROM goal_conversions 
            WHERE goal_id = ${goal.id} 
              AND session_id = ${event.sessionId}
              AND event_id = ${event._id.toString()}
          `;
          
          if (existingConversion.length === 0) {
            await Goal.recordConversion({
              goal_id: goal.id,
              website_id: website_id,
              session_id: event.sessionId,
              event_id: event._id.toString(),
              user_agent: event.userAgent,
              ip_address: event.ipAddress,
              referrer: event.referrer,
              page_url: event.url,
              conversion_value: goal.value || 0,
              custom_data: event.customData
            });
            
            totalConversions++;
            console.log(`      ✅ Recorded conversion for goal: ${goal.name}`);
          }
        }
      }
    }
    
    console.log(`\n🎉 Batch processing complete!`);
    console.log(`   📊 Total conversions recorded: ${totalConversions}`);
    
  } catch (error) {
    console.error('❌ Batch processing failed:', error);
  }
}

// Auto-run if called directly
if (require.main === module) {
  batchProcessGoalCompletions().then(() => {
    process.exit(0);
  });
}

module.exports = { batchProcessGoalCompletions };