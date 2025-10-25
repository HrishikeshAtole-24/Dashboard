const { connectNeonDB } = require('./config/neon');
const connectMongoDB = require('./config/mongo');
const Goal = require('./models/Goal');
const Event = require('./models/Event');

async function processExistingEvents() {
  try {
    console.log('🔄 Processing existing MongoDB events for goal completions...\n');
    
    // Connect to databases
    await connectNeonDB();
    await connectMongoDB();
    
    // Get your portfolio website events
    const websiteId = 'web_mh0j26qzc224338g7lt';
    
    // Get all goals for your website
    console.log('📋 Fetching goals for website...');
    const goals = await Goal.findByWebsiteId(websiteId);
    
    if (goals.length === 0) {
      console.log('❌ No goals found for this website!');
      return;
    }
    
    console.log(`✅ Found ${goals.length} goals:`);
    goals.forEach((goal, index) => {
      console.log(`${index + 1}. "${goal.name}" (${goal.goal_type})`);
      console.log(`   Conditions: ${JSON.stringify(goal.conditions)}`);
      console.log(`   Active: ${goal.is_active}`);
    });
    console.log();
    
    // Get recent events from MongoDB
    console.log('📊 Fetching recent events from MongoDB...');
    const events = await Event.find({
      websiteId: websiteId
    }).sort({ timestamp: -1 }).limit(10);
    
    console.log(`✅ Found ${events.length} events\n`);
    
    let totalConversions = 0;
    
    // Process each event for goal completion
    for (const event of events) {
      console.log(`🔍 Processing event: ${event.eventType} at ${event.timestamp}`);
      console.log(`   URL: ${event.url}`);
      console.log(`   Custom Data: ${JSON.stringify(event.customData)}`);
      
      // Check goal completion
      const eventData = {
        eventType: event.eventType,
        url: event.url,
        referrer: event.referrer,
        duration: event.duration,
        customData: event.customData
      };
      
      const completedGoals = await Goal.checkGoalCompletion(websiteId, eventData);
      
      if (completedGoals.length > 0) {
        console.log(`   🎯 ${completedGoals.length} goals completed:`);
        
        for (const goal of completedGoals) {
          console.log(`      - "${goal.name}" (Value: $${goal.value})`);
          
          // Record the conversion
          try {
            await Goal.recordConversion({
              goal_id: goal.id,
              website_id: websiteId,
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
            console.log(`      ✅ Conversion recorded successfully!`);
            
          } catch (conversionError) {
            console.log(`      ❌ Failed to record conversion: ${conversionError.message}`);
          }
        }
      } else {
        console.log(`   ❌ No goals completed`);
      }
      console.log();
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Processed ${events.length} events`);
    console.log(`   - Recorded ${totalConversions} conversions`);
    
    if (totalConversions > 0) {
      console.log(`\n🎉 Success! Check your Goals dashboard to see the conversions.`);
    } else {
      console.log(`\n💡 No conversions recorded. This might be because:`);
      console.log(`   1. Goal conditions don't match the event data`);
      console.log(`   2. Goals are not active`);
      console.log(`   3. Event data format doesn't match expectations`);
    }
    
  } catch (error) {
    console.error('❌ Error processing events:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

processExistingEvents();