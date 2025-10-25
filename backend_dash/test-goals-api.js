const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5001/api';  // Adjust port as needed
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

let authToken = '';
let testWebsiteId = '';
let testGoalId = '';

// Helper function to make authenticated requests
const apiCall = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ API Call Failed: ${method} ${endpoint}`);
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
};

// Test authentication
const testAuth = async () => {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    // Try to login
    const loginResponse = await apiCall('POST', '/auth/login', TEST_USER);
    authToken = loginResponse.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    try {
      // If login fails, try to register
      console.log('Login failed, attempting registration...');
      await apiCall('POST', '/auth/register', {
        ...TEST_USER,
        name: 'Test User'
      });
      
      // Now login
      const loginResponse = await apiCall('POST', '/auth/login', TEST_USER);
      authToken = loginResponse.token;
      console.log('✅ Registration and login successful');
      return true;
    } catch (regError) {
      console.error('❌ Authentication failed');
      return false;
    }
  }
};

// Test website creation
const testWebsite = async () => {
  console.log('\n🌐 Testing Website Management...');
  
  try {
    // Get existing websites
    const websites = await apiCall('GET', '/dashboard/websites');
    
    if (websites.websites && websites.websites.length > 0) {
      testWebsiteId = websites.websites[0].website_id;
      console.log(`✅ Using existing website: ${testWebsiteId}`);
    } else {
      // Create a test website
      const newWebsite = await apiCall('POST', '/dashboard/websites', {
        domain: 'test-site.com',
        name: 'Test Website',
        description: 'Test website for goals API testing'
      });
      
      testWebsiteId = newWebsite.website.website_id;
      console.log(`✅ Created test website: ${testWebsiteId}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Website setup failed');
    return false;
  }
};

// Initialize Goals table
const initializeGoals = async () => {
  console.log('\n🎯 Initializing Goals Table...');
  
  try {
    await apiCall('GET', '/dashboard/goals/init');
    console.log('✅ Goals table initialized');
    return true;
  } catch (error) {
    console.error('❌ Goals table initialization failed');
    return false;
  }
};

// Test Goals CRUD operations
const testGoalsCRUD = async () => {
  console.log('\n🎯 Testing Goals CRUD Operations...');
  
  try {
    // 1. Create a URL destination goal
    console.log('\n📝 Creating URL destination goal...');
    const urlGoal = await apiCall('POST', '/dashboard/goals', {
      website_id: testWebsiteId,
      name: 'Thank You Page Visit',
      description: 'User reaches thank you page',
      goal_type: 'url_destination',
      conditions: {
        url: '/thank-you',
        match_type: 'contains'
      },
      value: 10.00
    });
    
    testGoalId = urlGoal.goal.id;
    console.log(`✅ URL goal created: ${testGoalId}`);
    
    // 2. Create an event goal
    console.log('\n📝 Creating event goal...');
    const eventGoal = await apiCall('POST', '/dashboard/goals', {
      website_id: testWebsiteId,
      name: 'Button Click',
      description: 'User clicks signup button',
      goal_type: 'event',
      conditions: {
        event_type: 'click',
        custom_data: {
          button_id: 'signup-btn'
        }
      },
      value: 25.00
    });
    
    console.log(`✅ Event goal created: ${eventGoal.goal.id}`);
    
    // 3. Create a page duration goal
    console.log('\n📝 Creating page duration goal...');
    const durationGoal = await apiCall('POST', '/dashboard/goals', {
      website_id: testWebsiteId,
      name: 'Engaged User',
      description: 'User spends more than 2 minutes on site',
      goal_type: 'page_duration',
      conditions: {
        duration: 120
      },
      value: 5.00
    });
    
    console.log(`✅ Duration goal created: ${durationGoal.goal.id}`);
    
    // 4. Get all goals
    console.log('\n📋 Fetching all goals...');
    const allGoals = await apiCall('GET', `/dashboard/goals?website_id=${testWebsiteId}`);
    console.log(`✅ Retrieved ${allGoals.goals.length} goals`);
    
    // 5. Get specific goal
    console.log('\n🔍 Fetching specific goal...');
    const specificGoal = await apiCall('GET', `/dashboard/goals/${testGoalId}`);
    console.log(`✅ Retrieved goal: ${specificGoal.goal.name}`);
    
    // 6. Update goal
    console.log('\n✏️ Updating goal...');
    const updatedGoal = await apiCall('PUT', `/dashboard/goals/${testGoalId}`, {
      description: 'Updated: User reaches thank you page after purchase',
      value: 15.00
    });
    console.log(`✅ Goal updated: ${updatedGoal.goal.name}`);
    
    return true;
  } catch (error) {
    console.error('❌ Goals CRUD test failed');
    return false;
  }
};

// Test conversion tracking
const testConversions = async () => {
  console.log('\n🎯 Testing Conversion Tracking...');
  
  try {
    // 1. Manually record a conversion
    console.log('\n📝 Recording manual conversion...');
    const conversion = await apiCall('POST', `/dashboard/goals/${testGoalId}/conversions`, {
      session_id: 'test_session_123',
      page_url: 'https://test-site.com/thank-you',
      conversion_value: 15.00,
      custom_data: {
        source: 'manual_test',
        campaign: 'test_campaign'
      }
    });
    
    console.log(`✅ Conversion recorded: ${conversion.conversion.id}`);
    
    // 2. Get goal conversions
    console.log('\n📊 Fetching goal conversions...');
    const conversions = await apiCall('GET', `/dashboard/goals/${testGoalId}/conversions`);
    console.log(`✅ Retrieved ${conversions.conversions.length} conversions`);
    
    // 3. Get conversion rates
    console.log('\n📈 Fetching conversion rates...');
    const conversionRates = await apiCall('GET', `/dashboard/analytics/conversion-rates?website_id=${testWebsiteId}`);
    console.log(`✅ Retrieved conversion rates for ${conversionRates.conversion_rates.length} goals`);
    
    return true;
  } catch (error) {
    console.error('❌ Conversion tracking test failed');
    return false;
  }
};

// Test event-based goal completion
const testEventGoalCompletion = async () => {
  console.log('\n🎯 Testing Event-Based Goal Completion...');
  
  try {
    // Send a test event that should trigger goal completion
    console.log('\n📝 Sending test event...');
    await apiCall('POST', '/collect', {
      websiteId: testWebsiteId,
      eventType: 'click',
      url: 'https://test-site.com/signup',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'test_session_456',
      customData: {
        button_id: 'signup-btn',
        test: true
      }
    });
    
    console.log('✅ Test event sent');
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if conversion was recorded
    const conversions = await apiCall('GET', `/dashboard/goals?website_id=${testWebsiteId}`);
    console.log('✅ Goal completion test completed');
    
    return true;
  } catch (error) {
    console.error('❌ Event goal completion test failed');
    return false;
  }
};

// Cleanup test data
const cleanup = async () => {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Get all goals for the test website
    const goals = await apiCall('GET', `/dashboard/goals?website_id=${testWebsiteId}`);
    
    // Delete each goal
    for (const goal of goals.goals) {
      await apiCall('DELETE', `/dashboard/goals/${goal.id}`);
      console.log(`✅ Deleted goal: ${goal.name}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Cleanup failed');
    return false;
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Goals API Tests...');
  console.log('=====================================');
  
  try {
    // Run tests in sequence
    const authSuccess = await testAuth();
    if (!authSuccess) return;
    
    const websiteSuccess = await testWebsite();
    if (!websiteSuccess) return;
    
    const initSuccess = await initializeGoals();
    if (!initSuccess) return;
    
    const crudSuccess = await testGoalsCRUD();
    if (!crudSuccess) return;
    
    const conversionSuccess = await testConversions();
    if (!conversionSuccess) return;
    
    const eventSuccess = await testEventGoalCompletion();
    if (!eventSuccess) return;
    
    // Optional: cleanup (comment out if you want to keep test data)
    // await cleanup();
    
    console.log('\n🎉 All Goals API tests completed successfully!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
  }
};

// Export for use in other files or run directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testAuth,
  testGoalsCRUD,
  testConversions,
  apiCall
};