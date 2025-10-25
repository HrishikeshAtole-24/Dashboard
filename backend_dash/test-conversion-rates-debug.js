require('dotenv').config();
const { connectNeonDB } = require('./config/neon');
const Goal = require('./models/Goal');

async function testConversionRatesDirectly() {
  try {
    console.log('Connecting to database...');
    await connectNeonDB();
    
    console.log('Testing Goal.getConversionRates with actual parameters...');
    
    const websiteId = 'web_mh0j26qzc224338g7lt';
    const userId = 1;
    const options = {
      startDate: '2025-09-25',
      endDate: '2025-10-25'
    };
    
    console.log('Parameters:', { websiteId, userId, options });
    
    const result = await Goal.getConversionRates(websiteId, userId, options);
    
    console.log('✅ Success! Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error in Goal.getConversionRates:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

testConversionRatesDirectly();