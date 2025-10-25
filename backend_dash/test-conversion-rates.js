const Goal = require('./models/Goal');
const { connectNeonDB } = require('./config/neon');

async function testConversionRates() {
  try {
    console.log('Connecting to Neon database...');
    await connectNeonDB();
    console.log('✅ Database connected');
    
    console.log('Testing Goal.getConversionRates...');
    
    // Test parameters
    const websiteId = 'web_mh0j26qzc224338g7lt';
    const userId = 1;
    const options = {
      startDate: '2025-09-25',
      endDate: '2025-10-25'
    };
    
    console.log('Calling Goal.getConversionRates with:', { websiteId, userId, options });
    
    const result = await Goal.getConversionRates(websiteId, userId, options);
    
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('✅ Goal.getConversionRates works correctly!');
    
  } catch (error) {
    console.error('❌ Error in Goal.getConversionRates:', error);
    console.error('Stack trace:', error.stack);
  }
}

testConversionRates().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});