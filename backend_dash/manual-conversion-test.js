// Manual conversion test script
// Run this with: node manual-conversion-test.js

const Goal = require('./models/Goal');

// Simulate a manual conversion for testing
const testConversion = {
  goal_id: 2, // Your Resume Download goal ID
  website_id: 'web_mh0j26qzc224338g7lt',
  session_id: 'test_session_123',
  event_id: 'test_event_456',
  user_agent: 'Test Browser',
  ip_address: '127.0.0.1',
  referrer: 'https://vercel.com/',
  page_url: 'https://hrishiprotfolio.vercel.app/',
  conversion_value: 10,
  custom_data: {
    fileUrl: 'https://hrishiprotfolio.vercel.app/hrishi_resume.pdf',
    fileName: 'hrishi_resume.pdf',
    fileType: 'pdf'
  }
};

console.log('🧪 Testing manual conversion recording...');
console.log('Conversion data:', JSON.stringify(testConversion, null, 2));

// This would record a test conversion to see if the database works
// Goal.recordConversion(testConversion).then(() => {
//   console.log('✅ Test conversion recorded successfully!');
// }).catch(error => {
//   console.error('❌ Failed to record test conversion:', error);
// });

console.log('💡 Uncomment the Goal.recordConversion call to test database insertion');