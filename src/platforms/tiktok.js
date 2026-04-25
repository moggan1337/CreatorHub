/**
 * TikTok API Integration
 * 
 * This module provides integration with TikTok's Creator API.
 * Note: The real TikTok API requires OAuth2 authentication and has
 * specific approval requirements. This implementation includes mock
 * data for development and can be extended with real API calls.
 */

const axios = require('axios');

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';

class TikTokPlatform {
  constructor(config = {}) {
    this.clientKey = config.clientKey || process.env.TIKTOK_CLIENT_KEY;
    this.clientSecret = config.clientSecret || process.env.TIKTOK_CLIENT_SECRET;
    this.accessToken = config.accessToken || process.env.TIKTOK_ACCESS_TOKEN;
    this.apiBase = TIKTOK_API_BASE;
  }

  /**
   * Check if the platform is properly configured
   */
  isConfigured() {
    return !!(this.clientKey && this.clientSecret && this.accessToken);
  }

  /**
   * Get authorization header
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetch user profile information
   */
  async getProfile(userId = 'me') {
    if (!this.isConfigured()) {
      return this.getMockProfile();
    }

    try {
      const response = await axios.post(
        `${this.apiBase}/user/info/`,
        {
          fields: ['open_id', 'display_name', 'avatar_url', 'followers_count', 'following_count', 'likes_count']
        },
        {
          headers: this.getHeaders(),
          params: { open_id: userId }
        }
      );
      return this.transformProfile(response.data);
    } catch (error) {
      console.error('TikTok API Error:', error.message);
      return this.getMockProfile();
    }
  }

  /**
   * Fetch user's videos/posts
   */
  async getVideos(limit = 20) {
    if (!this.isConfigured()) {
      return this.getMockVideos(limit);
    }

    try {
      const response = await axios.post(
        `${this.apiBase}/video/list/`,
        {
          max_count: limit,
          fields: ['id', 'create_time', 'cover_image_url', 'share_url', 'title', 'like_count', 'comment_count', 'share_count', 'view_count']
        },
        { headers: this.getHeaders() }
      );
      return this.transformVideos(response.data.videos || []);
    } catch (error) {
      console.error('TikTok API Error:', error.message);
      return this.getMockVideos(limit);
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(period = '7d') {
    if (!this.isConfigured()) {
      return this.getMockAnalytics(period);
    }

    try {
      const response = await axios.post(
        `${this.apiBase}/analytics/overview/`,
        {
          metrics: ['video_views', 'profile_views', 'followers_gained', 'likes_received'],
          period
        },
        { headers: this.getHeaders() }
      );
      return this.transformAnalytics(response.data);
    } catch (error) {
      console.error('TikTok API Error:', error.message);
      return this.getMockAnalytics(period);
    }
  }

  /**
   * Get video-specific analytics
   */
  async getVideoAnalytics(videoId) {
    if (!this.isConfigured()) {
      return this.getMockVideoAnalytics(videoId);
    }

    try {
      const response = await axios.post(
        `${this.apiBase}/video/data/`,
        {
          video_id: videoId,
          fields: ['video_views', 'engagement_rate', 'average_watch_time', 'retention_rate']
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('TikTok API Error:', error.message);
      return this.getMockVideoAnalytics(videoId);
    }
  }

  /**
   * Transform TikTok profile to standard format
   */
  transformProfile(data) {
    return {
      platform: 'tiktok',
      username: data.display_name || 'creator',
      displayName: data.display_name || 'TikTok Creator',
      avatar: data.avatar_url,
      followers: data.followers_count || 0,
      following: data.following_count || 0,
      likes: data.likes_count || 0,
      profileUrl: `https://www.tiktok.com/@${data.display_name || 'creator'}`,
      verified: data.is_verified || false,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Transform TikTok videos to standard format
   */
  transformVideos(videos) {
    return videos.map(video => ({
      id: video.id,
      platform: 'tiktok',
      title: video.title,
      thumbnail: video.cover_image_url,
      url: video.share_url,
      views: video.view_count || 0,
      likes: video.like_count || 0,
      comments: video.comment_count || 0,
      shares: video.share_count || 0,
      publishedAt: new Date(video.create_time * 1000).toISOString(),
      engagement: this.calculateEngagement(video)
    }));
  }

  /**
   * Calculate engagement rate
   */
  calculateEngagement(video) {
    const views = video.view_count || 1;
    return ((video.like_count + video.comment_count + video.share_count) / views * 100).toFixed(2);
  }

  /**
   * Transform analytics to standard format
   */
  transformAnalytics(data) {
    return {
      platform: 'tiktok',
      period: data.period || '7d',
      metrics: {
        views: data.video_views || 0,
        profileViews: data.profile_views || 0,
        followers: data.followers_gained || 0,
        likes: data.likes_received || 0
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate mock profile data for development
   */
  getMockProfile() {
    return {
      platform: 'tiktok',
      username: 'mock_creator',
      displayName: 'Mock TikTok Creator',
      avatar: 'https://p16-pu.xx-webapp.example.com/avatar/mock.jpg',
      followers: Math.floor(Math.random() * 100000) + 1000,
      following: Math.floor(Math.random() * 500) + 50,
      likes: Math.floor(Math.random() * 1000000) + 10000,
      profileUrl: 'https://www.tiktok.com/@mock_creator',
      verified: true,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate mock videos for development
   */
  getMockVideos(count = 20) {
    const videos = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
      const views = Math.floor(Math.random() * 500000) + 1000;
      const likes = Math.floor(views * (Math.random() * 0.15 + 0.02));
      const comments = Math.floor(views * (Math.random() * 0.01 + 0.001));
      const shares = Math.floor(views * (Math.random() * 0.02 + 0.005));
      
      videos.push({
        id: `tiktok_video_${i + 1}`,
        platform: 'tiktok',
        title: `Trending Video #${i + 1} 🔥`,
        thumbnail: `https://p16-pu.xx-webapp.example.com/thumb/${i + 1}.jpg`,
        url: `https://www.tiktok.com/@mock_creator/video/${1700000000 + i * 3600}`,
        views,
        likes,
        comments,
        shares,
        publishedAt: new Date(now - i * 86400000).toISOString(),
        engagement: ((likes + comments + shares) / views * 100).toFixed(2)
      });
    }
    
    return videos;
  }

  /**
   * Generate mock analytics for development
   */
  getMockAnalytics(period = '7d') {
    const multiplier = period === '30d' ? 4.3 : period === '90d' ? 13 : 1;
    
    return {
      platform: 'tiktok',
      period,
      metrics: {
        views: Math.floor((Math.random() * 500000 + 10000) * multiplier),
        profileViews: Math.floor((Math.random() * 50000 + 1000) * multiplier),
        followers: Math.floor(Math.random() * 5000 * multiplier),
        likes: Math.floor((Math.random() * 100000 + 5000) * multiplier)
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate mock video analytics for development
   */
  getMockVideoAnalytics(videoId) {
    const views = Math.floor(Math.random() * 100000) + 1000;
    
    return {
      platform: 'tiktok',
      videoId,
      metrics: {
        views,
        engagementRate: (Math.random() * 15 + 2).toFixed(2),
        averageWatchTime: Math.floor(Math.random() * 30 + 5),
        retentionRate: (Math.random() * 40 + 30).toFixed(2),
        likes: Math.floor(views * (Math.random() * 0.15 + 0.02)),
        comments: Math.floor(views * (Math.random() * 0.01 + 0.001)),
        shares: Math.floor(views * (Math.random() * 0.02 + 0.005))
      },
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = TikTokPlatform;
