const Event = require('./models/Event');
const Goal = require('./models/Goal');
const Website = require('./models/Website');

async function debugGoalsAndEvents() {
  try {
    console.log('🔍 Debugging Goals and Events for Portfolio Website...\n');
    
    // Check MongoDB events for recent activity
    console.log('📊 Recent Events in MongoDB:');
    const recentEvents = await Event.find({
      websiteId: 'web_mh0j26qzc224338g7lt'
    }).sort({ timestamp: -1 }).limit(10);
    
    console.log(`Found ${recentEvents.length} events for your portfolio website:`);
    recentEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.eventType} - ${event.pageUrl} - ${event.timestamp}`);
      if (event.elementText) console.log(`   Text: "${event.elementText}"`);
      if (event.href) console.log(`   Link: ${event.href}`);
      console.log(`   Session: ${event.sessionId}\n`);
    });
    
    // Check for click events that might be resume downloads
    console.log('🎯 Looking for potential resume download events:');
    const clickEvents = await Event.find({
      websiteId: 'web_mh0j26qzc224338g7lt',
      eventType: 'click'
    }).sort({ timestamp: -1 }).limit(5);
    
    clickEvents.forEach((event, index) => {
      console.log(`${index + 1}. Click Event:`);
      console.log(`   Element: ${event.element || 'Unknown'}`);
      console.log(`   Text: "${event.elementText || 'No text'}"`);
      console.log(`   Link: ${event.href || 'No link'}`);
      console.log(`   Page: ${event.pageUrl}`);
      console.log(`   Time: ${event.timestamp}\n`);
    });
    
    // Check current goals configuration
    console.log('⚙️ Current Goals Configuration:');
    const goals = await Goal.findByWebsiteId('web_mh0j26qzc224338g7lt');
    
    if (goals.length === 0) {
      console.log('❌ No goals found! You need to create goals first.');
    } else {
      goals.forEach((goal, index) => {
        console.log(`${index + 1}. Goal: "${goal.name}"`);
        console.log(`   Type: ${goal.goal_type}`);
        console.log(`   Conditions: ${JSON.stringify(goal.conditions, null, 2)}`);
        console.log(`   Active: ${goal.is_active}`);
        console.log(`   Created: ${goal.created_at}\n`);
      });
    }
    
    // Check goal conversions
    console.log('🎯 Goal Conversions Data:');
    if (goals.length > 0) {
      const conversionRates = await Goal.getConversionRates('web_mh0j26qzc224338g7lt', goals[0].user_id);
      console.log('Conversion Rates:', JSON.stringify(conversionRates, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    process.exit(0);
  }
}

debugGoalsAndEvents();