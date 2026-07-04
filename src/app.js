/**
 * CreatorHub Express Application
 * 
 * Main application entry point with routes and middleware.
 */

require('dotenv').config();

const express = require('express');
const analyticsRoutes = require('./routes/analytics');
const AnalyticsAggregator = require('./analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers for API access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Initialize analytics aggregator
const analytics = new AnalyticsAggregator({
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    accessToken: process.env.TIKTOK_ACCESS_TOKEN
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY
  },
  instagram: {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN
  },
  twitter: {
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
    xquikApiKey: process.env.XQUIK_API_KEY,
    xquikBaseUrl: process.env.XQUIK_BASE_URL
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CreatorHub',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'CreatorHub API',
    version: '1.0.0',
    description: 'Cross-platform analytics for social media creators',
    endpoints: {
      health: 'GET /health',
      profiles: 'GET /api/profiles',
      content: 'GET /api/content',
      analytics: 'GET /api/analytics',
      analyticsPeriod: 'GET /api/analytics/:period',
      compare: 'GET /api/compare',
      trending: 'GET /api/trending',
      report: 'GET /api/report',
      platforms: 'GET /api/platforms/:platform',
      platformsProfile: 'GET /api/platforms/:platform/profile',
      platformsContent: 'GET /api/platforms/:platform/content',
      platformsAnalytics: 'GET /api/platforms/:platform/analytics'
    }
  });
});

// Mount analytics routes
app.use('/api', analyticsRoutes);

// Make analytics available on app for route access
app.locals.analytics = analytics;

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎬 CreatorHub Server Started                            ║
║                                                           ║
║   Local:    http://localhost:${PORT}                        ║
║   Health:   http://localhost:${PORT}/health                 ║
║   API Info: http://localhost:${PORT}/api                    ║
║                                                           ║
║   Platforms: TikTok, YouTube, Instagram, Twitter          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
