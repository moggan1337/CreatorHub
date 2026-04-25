/**
 * Analytics API Routes
 * 
 * Provides RESTful endpoints for cross-platform analytics.
 */

const express = require('express');
const router = express.Router();

/**
 * GET /api/profiles
 * Get unified profile data for all configured platforms
 */
router.get('/profiles', async (req, res, next) => {
  try {
    const { tiktok, youtube, instagram, twitter } = req.query;
    const usernames = {};
    
    if (tiktok) usernames.tiktok = tiktok;
    if (youtube) usernames.youtube = youtube;
    if (instagram) usernames.instagram = instagram;
    if (twitter) usernames.twitter = twitter;

    const profiles = await req.app.locals.analytics.getUnifiedProfile(usernames);
    
    res.json({
      success: true,
      data: profiles
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content
 * Get unified content from all platforms
 */
router.get('/content', async (req, res, next) => {
  try {
    const limits = {
      tiktok: parseInt(req.query.tiktokLimit) || 10,
      youtube: parseInt(req.query.youtubeLimit) || 10,
      instagram: parseInt(req.query.instagramLimit) || 10,
      twitter: parseInt(req.query.twitterLimit) || 10
    };

    const content = await req.app.locals.analytics.getUnifiedContent(limits);
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics
 * Get analytics summary for all platforms
 */
router.get('/analytics', async (req, res, next) => {
  try {
    const period = req.query.period || '7d';
    const analytics = await req.app.locals.analytics.getUnifiedAnalytics(period);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/:period
 * Get analytics for a specific period
 */
router.get('/analytics/:period', async (req, res, next) => {
  try {
    const { period } = req.params;
    const validPeriods = ['24h', '7d', '30d', '90d'];
    
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid period',
        message: `Period must be one of: ${validPeriods.join(', ')}`
      });
    }

    const analytics = await req.app.locals.analytics.getUnifiedAnalytics(period);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/compare
 * Compare performance across platforms
 */
router.get('/compare', async (req, res, next) => {
  try {
    const { tiktok, youtube, instagram, twitter } = req.query;
    const usernames = {};
    
    if (tiktok) usernames.tiktok = tiktok;
    if (youtube) usernames.youtube = youtube;
    if (instagram) usernames.instagram = instagram;
    if (twitter) usernames.twitter = twitter;

    const comparison = await req.app.locals.analytics.comparePlatforms(usernames);
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/trending
 * Get trending content across all platforms
 */
router.get('/trending', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const trending = await req.app.locals.analytics.getTrendingContent(limit);
    
    res.json({
      success: true,
      data: trending
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/report
 * Generate a comprehensive performance report
 */
router.get('/report', async (req, res, next) => {
  try {
    const { tiktok, youtube, instagram, twitter, period } = req.query;
    const usernames = {};
    
    if (tiktok) usernames.tiktok = tiktok;
    if (youtube) usernames.youtube = youtube;
    if (instagram) usernames.instagram = instagram;
    if (twitter) usernames.twitter = twitter;

    const report = await req.app.locals.analytics.generateReport(
      usernames,
      period || '7d'
    );
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/platforms
 * List available platforms
 */
router.get('/platforms', (req, res) => {
  res.json({
    success: true,
    data: {
      platforms: [
        {
          id: 'tiktok',
          name: 'TikTok',
          icon: '🎵',
          endpoints: {
            profile: '/api/platforms/tiktok/profile',
            content: '/api/platforms/tiktok/content',
            analytics: '/api/platforms/tiktok/analytics'
          }
        },
        {
          id: 'youtube',
          name: 'YouTube',
          icon: '📹',
          endpoints: {
            profile: '/api/platforms/youtube/profile',
            content: '/api/platforms/youtube/content',
            analytics: '/api/platforms/youtube/analytics'
          }
        },
        {
          id: 'instagram',
          name: 'Instagram',
          icon: '📸',
          endpoints: {
            profile: '/api/platforms/instagram/profile',
            content: '/api/platforms/instagram/content',
            insights: '/api/platforms/instagram/insights'
          }
        },
        {
          id: 'twitter',
          name: 'Twitter/X',
          icon: '🐦',
          endpoints: {
            profile: '/api/platforms/twitter/profile',
            tweets: '/api/platforms/twitter/tweets',
            mentions: '/api/platforms/twitter/mentions'
          }
        }
      ]
    }
  });
});

/**
 * GET /api/platforms/:platform
 * Get platform-specific data
 */
router.get('/platforms/:platform', async (req, res, next) => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['tiktok', 'youtube', 'instagram', 'twitter'];
    
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform',
        message: `Platform must be one of: ${validPlatforms.join(', ')}`
      });
    }

    const platformInstance = req.app.locals.analytics.getPlatform(platform);
    const [profile, content] = await Promise.all([
      platformInstance.getProfile(),
      platformInstance.getVideos ? platformInstance.getVideos(10) : 
        platformInstance.getMedia ? platformInstance.getMedia(10) :
        platformInstance.getTweets ? platformInstance.getTweets('me', 10) : []
    ]);

    res.json({
      success: true,
      data: {
        platform,
        profile,
        recentContent: content,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/platforms/:platform/profile
 * Get platform-specific profile
 */
router.get('/platforms/:platform/profile', async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { username } = req.query;
    
    const platformInstance = req.app.locals.analytics.getPlatform(platform);
    const profile = await platformInstance.getProfile(username);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/platforms/:platform/content
 * Get platform-specific content
 */
router.get('/platforms/:platform/content', async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { limit } = req.query;
    const limitNum = parseInt(limit) || 20;
    
    const platformInstance = req.app.locals.analytics.getPlatform(platform);
    let content;

    switch (platform.toLowerCase()) {
      case 'tiktok':
        content = await platformInstance.getVideos(limitNum);
        break;
      case 'youtube':
        content = await platformInstance.getVideos(null, limitNum);
        break;
      case 'instagram':
        content = await platformInstance.getMedia(limitNum);
        break;
      case 'twitter':
        content = await platformInstance.getTweets(req.query.username || 'me', limitNum);
        break;
      default:
        content = [];
    }
    
    res.json({
      success: true,
      data: {
        platform,
        content,
        count: content.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/platforms/:platform/analytics
 * Get platform-specific analytics
 */
router.get('/platforms/:platform/analytics', async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { period } = req.query;
    
    const platformInstance = req.app.locals.analytics.getPlatform(platform);
    let analytics;

    switch (platform.toLowerCase()) {
      case 'tiktok':
        analytics = await platformInstance.getAnalytics(period || '7d');
        break;
      case 'youtube':
        analytics = await platformInstance.getProfile();
        break;
      case 'instagram':
        analytics = await platformInstance.getInsights(period || '28d');
        break;
      case 'twitter':
        const profile = await platformInstance.getProfile(req.query.username);
        analytics = {
          ...profile,
          period: period || '7d'
        };
        break;
      default:
        analytics = null;
    }
    
    res.json({
      success: true,
      data: {
        platform,
        analytics,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
