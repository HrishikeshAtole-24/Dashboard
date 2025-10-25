const { connectNeonDB } = require('./config/neon');
const Goal = require('./models/Goal');

async function testGoalMatching() {
  try {
    console.log('🧪 Testing Goal Completion Logic...\n');
    
    // Connect to Neon DB
    await connectNeonDB();
    
    // Test event data from your MongoDB records
    const testEventData = {
      eventType: "download",
      url: "https://hrishiprotfolio.vercel.app/",
      referrer: "https://vercel.com/",
      duration: 0,
      customData: {
        fileUrl: "https://hrishiprotfolio.vercel.app/hrishi_resume.pdf",
        fileName: "hrishi_resume.pdf",
        fileType: "pdf"
      }
    };
    
    console.log('📊 Test Event Data:');
    console.log(JSON.stringify(testEventData, null, 2));
    console.log();
    
    // Check if this event would complete any goals
    const completedGoals = await Goal.checkGoalCompletion('web_mh0j26qzc224338g7lt', testEventData);
    
    console.log('🎯 Goal Completion Results:');
    if (completedGoals.length === 0) {
      console.log('❌ No goals completed!');
      console.log('💡 This means either:');
      console.log('   1. No download goals exist for this website');
      console.log('   2. Goal conditions don\'t match the event data');
      console.log('   3. Goals are not active');
    } else {
      console.log(`✅ ${completedGoals.length} goals completed:`);
      completedGoals.forEach((goal, index) => {
        console.log(`${index + 1}. Goal: "${goal.name}" (ID: ${goal.id})`);
        console.log(`   Type: ${goal.goal_type}`);
        console.log(`   Conditions: ${JSON.stringify(goal.conditions, null, 2)}`);
        console.log(`   Value: $${goal.value}`);
        console.log();
      });
    }
    
    // Let's also check what goals exist for this website
    console.log('📋 All Goals for Website:');
    const allGoals = await Goal.findByWebsiteId('web_mh0j26qzc224338g7lt');
    
    if (allGoals.length === 0) {
      console.log('❌ No goals found for this website!');
    } else {
      allGoals.forEach((goal, index) => {
        console.log(`${index + 1}. "${goal.name}" (${goal.goal_type})`);
        console.log(`   Conditions: ${JSON.stringify(goal.conditions, null, 2)}`);
        console.log(`   Active: ${goal.is_active}`);
        console.log(`   Created: ${goal.created_at}`);
        console.log();
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testGoalMatching();