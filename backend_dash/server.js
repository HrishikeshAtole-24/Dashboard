const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import database connections
const connectMongoDB = require('./config/mongo');
const { connectNeonDB } = require('./config/neon');

// Import routes
const authRoutes = require('./routes/auth');
const collectRoutes = require('./routes/collect');
const dashboardRoutes = require('./routes/dashboard');

// Import cron jobs
const aggregationJob = require('./cron/aggregateJob');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Collection endpoint rate limiting (more generous for tracking)
const collectLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Allow more requests for analytics collection
});

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { sql } = require('./config/neon').getNeonDB();
    
    // Check MongoDB connection
    const mongoStatus = require('mongoose').connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    // Check Neon PostgreSQL connection
    let neonStatus = 'Disconnected';
    try {
      await sql`SELECT 1 as test`;
      neonStatus = 'Connected';
    } catch (error) {
      neonStatus = `Error: ${error.message}`;
    }
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      databases: {
        mongodb: mongoStatus,
        neon_postgresql: neonStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      databases: {
        mongodb: 'Unknown',
        neon_postgresql: 'Unknown'
      }
    });
  }
});

// Serve tracking script
app.get('/tracking/script.js', (req, res) => {
  try {
    const scriptPath = path.join(__dirname, '../tracking-script/track.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(scriptContent);
  } catch (error) {
    console.error('Error serving tracking script:', error);
    res.status(404).send('// Tracking script not found');
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/collect', collectLimiter, collectRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize databases and start server
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectMongoDB();
    console.log('✅ Connected to MongoDB Atlas');

    // Connect to Neon DB
    await connectNeonDB();
    console.log('✅ Connected to Neon PostgreSQL');

    // Start cron jobs
    aggregationJob.start();
    console.log('✅ Aggregation cron job started');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Analytics Dashboard Backend`);
      console.log(`📈 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  aggregationJob.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  aggregationJob.stop();
  process.exit(0);
});

startServer();