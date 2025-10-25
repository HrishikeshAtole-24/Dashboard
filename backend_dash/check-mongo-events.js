require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

async function checkMongoEvents() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Check total events count
    const totalEvents = await Event.countDocuments();
    console.log(`Total events in MongoDB: ${totalEvents}`);
    
    if (totalEvents > 0) {
      // Get sample events
      const sampleEvents = await Event.find().limit(5).sort({ timestamp: -1 });
      console.log('Sample events:', JSON.stringify(sampleEvents, null, 2));
      
      // Check events for specific website
      const websiteEvents = await Event.find({ websiteId: 'web_mh0j26qzc224338g7lt' }).limit(5);
      console.log(`Events for website web_mh0j26qzc224338g7lt: ${websiteEvents.length}`);
      
      if (websiteEvents.length > 0) {
        console.log('Sample website events:', JSON.stringify(websiteEvents, null, 2));
      }
      
      // Get unique sessions for the website
      const uniqueSessions = await Event.distinct('sessionId', { websiteId: 'web_mh0j26qzc224338g7lt' });
      console.log(`Unique sessions for website: ${uniqueSessions.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking MongoDB events:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkMongoEvents();