const { connectNeonDB } = require('./config/neon');
const DailyStats = require('./models/DailyStats');
const Website = require('./models/Website');

async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample analytics data...');
    
    await connectNeonDB();
    console.log('✅ Connected to Neon database');
    
    // Initialize tables
    await DailyStats.createTable();
    console.log('✅ DailyStats table ready');
    
    // Get existing websites
    const websites = await Website.getAll();
    console.log(`📊 Found ${websites.length} websites in database`);
    
    if (websites.length === 0) {
      console.log('❌ No websites found. Please create websites first.');
      return;
    }
    
    // Generate 30 days of sample data for each website
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    for (const website of websites) {
      console.log(`📈 Generating data for website: ${website.domain} (${website.website_id})`);
      
      for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        // Generate realistic analytics data
        const baseVisits = 100 + Math.floor(Math.random() * 500);
        const uniqueVisitors = Math.floor(baseVisits * (0.6 + Math.random() * 0.3)); // 60-90% of visits
        const pageViews = Math.floor(baseVisits * (1.2 + Math.random() * 1.8)); // 1.2-3x visits
        const avgDuration = 60 + Math.random() * 300; // 1-6 minutes
        const bounceRate = 20 + Math.random() * 60; // 20-80%
        
        const samplePages = [
          '/',
          '/about',
          '/contact',
          '/products',
          '/services',
          '/blog',
          '/pricing'
        ];
        
        const sampleReferrers = [
          'google.com',
          'facebook.com',
          'twitter.com',
          'linkedin.com',
          'direct',
          'bing.com',
          'youtube.com'
        ];
        
        const sampleCountries = [
          'United States',
          'United Kingdom',
          'Canada',
          'Germany',
          'France',
          'Australia',
          'India'
        ];
        
        const deviceStats = {
          desktop: Math.floor(Math.random() * 60) + 30,
          mobile: Math.floor(Math.random() * 50) + 20,
          tablet: Math.floor(Math.random() * 20) + 5
        };
        
        const browserStats = {
          chrome: Math.floor(Math.random() * 50) + 40,
          firefox: Math.floor(Math.random() * 20) + 10,
          safari: Math.floor(Math.random() * 25) + 15,
          edge: Math.floor(Math.random() * 15) + 5,
          other: Math.floor(Math.random() * 10) + 2
        };
        
        const statsData = {
          website_id: website.website_id,
          date: currentDate.toISOString().split('T')[0],
          total_visits: baseVisits,
          unique_visitors: uniqueVisitors,
          page_views: pageViews,
          avg_duration: avgDuration,
          bounce_rate: bounceRate,
          top_page: samplePages[Math.floor(Math.random() * samplePages.length)],
          top_referrer: sampleReferrers[Math.floor(Math.random() * sampleReferrers.length)],
          top_country: sampleCountries[Math.floor(Math.random() * sampleCountries.length)],
          device_stats: deviceStats,
          browser_stats: browserStats
        };
        
        await DailyStats.upsert(statsData);
      }
      
      console.log(`✅ Generated 30 days of data for ${website.domain}`);
    }
    
    console.log('🎉 Sample data seeding completed successfully!');
    
    // Show summary
    console.log('\n📊 Data Summary:');
    for (const website of websites) {
      const stats = await DailyStats.getOverviewStats(website.website_id, 30);
      console.log(`\n🌐 ${website.domain}:`);
      console.log(`   Total Visits: ${stats.total_visits || 0}`);
      console.log(`   Unique Visitors: ${stats.unique_visitors || 0}`);
      console.log(`   Page Views: ${stats.total_page_views || 0}`);
      console.log(`   Avg Duration: ${Math.round(stats.avg_duration || 0)}s`);
      console.log(`   Avg Bounce Rate: ${Math.round(stats.avg_bounce_rate || 0)}%`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedSampleData().then(() => {
    console.log('✅ Seeding complete');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = seedSampleData;