/**
 * Instagram Basic Display API Integration
 * 
 * This module provides integration with Instagram's Basic Display API.
 * Requires an Instagram App and Long-Lived Access Token.
 * Note: The Basic Display API has limited access. For full business features,
 * consider using the Instagram Graph API.
 */

const axios = require('axios');

const INSTAGRAM_API_BASE = 'https://graph.instagram.com';

class InstagramPlatform {
  constructor(config = {}) {
    this.accessToken = config.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;
    this.userId = config.userId || null;
    this.apiBase = INSTAGRAM_API_BASE;
  }

  /**
   * Check if the platform is properly configured
   */
  isConfigured() {
    return !!this.accessToken;
  }

  /**
   * Set the Instagram Business Account ID
   */
  setUserId(userId) {
    this.userId = userId;
    return this;
  }

  /**
   * Get user's media accounts
   */
  async getAccounts() {
    if (!this.isConfigured()) {
      return [{ id: 'mock_ig_user_id', username: 'mock_creator', name: 'Mock IG User' }];
    }

    try {
      const response = await axios.get(`${this.apiBase}/me/accounts`, {
        params: { access_token: this.accessToken }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Instagram API Error:', error.message);
      return [{ id: 'mock_ig_user_id', username: 'mock_creator', name: 'Mock IG User' }];
    }
  }

  /**
   * Fetch user profile information
   */
  async getProfile(userId = null) {
    const targetUserId = userId || this.userId;

    if (!this.isConfigured()) {
      return this.getMockProfile(targetUserId);
    }

    try {
      const fields = 'id,username,account_type,media_count,followers_count,follows_count,name,biography,website,profile_picture_url,hd_profile_pic_url_info';
      const response = await axios.get(`${this.apiBase}/${targetUserId || 'me'}`, {
        params: {
          fields,
          access_token: this.accessToken
        }
      });

      return this.transformProfile(response.data);
    } catch (error) {
      console.error('Instagram API Error:', error.message);
      return this.getMockProfile(targetUserId);
    }
  }

  /**
   * Fetch user's media (posts)
   */
  async getMedia(limit = 25, userId = null) {
    const targetUserId = userId || this.userId;

    if (!this.isConfigured()) {
      return this.getMockMedia(limit);
    }

    try {
      const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,children{media_url,media_type},like_count,comments_count';
      const response = await axios.get(`${this.apiBase}/${targetUserId || 'me'}/media`, {
        params: {
          fields,
          limit,
          access_token: this.accessToken
        }
      });

      return this.transformMedia(response.data.data || []);
    } catch (error) {
      console.error('Instagram API Error:', error.message);
      return this.getMockMedia(limit);
    }
  }

  /**
   * Fetch media details
   */
  async getMediaDetails(mediaId) {
    if (!this.isConfigured()) {
      return this.getMockMediaDetails(mediaId);
    }

    try {
      const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,children{media_url,media_type},like_count,comments_count,insights';
      const response = await axios.get(`${this.apiBase}/${mediaId}`, {
        params: {
          fields,
          access_token: this.accessToken
        }
      });

      return this.transformMediaDetails(response.data);
    } catch (error) {
      console.error('Instagram API Error:', error.message);
      return this.getMockMediaDetails(mediaId);
    }
  }

  /**
   * Get insights for media (requires Instagram Graph API)
   */
  async getMediaInsights(mediaId) {
    if (!this.isConfigured()) {
      return this.getMockMediaInsights(mediaId);
    }

    try {
      const fields = 'id,reach,saved,impressions,engagement,video_views';
      const response = await axios.get(`${this.apiBase}/${mediaId}/insights`, {
        params: {
          metric: fields,
          access_token: this.accessToken
        }
      });

      return this.transformInsights(response.data.data || []);
    } catch (error) {
      console.error('Instagram API Error:', error.message);
      return this.getMockMediaInsights(mediaId);
    }
  }

  /**
   * Get user insights (requires Instagram Graph API)
   */
  async getInsights(period = '28d') {
    if (!this.isConfigured()) {
      return this.getMockInsights(period);
    }

    try {
      const response = await axios.get(`${this.apiBase}/me/insights`, {
        params: {
          metric: 'follower_count,followed_by_count,media_count',
          period,
          access_token: this.accessToken
        }
      });

      return this.transformInsights(response.data.data || []);
    } catch (error) {
      console.error('Instagram API Error:', error.message);
      return this.getMockInsights(period);
    }
  }

  /**
   * Get stories (requires Instagram Graph API)
   */
  async getStories(limit = 10) {
    if (!this.isConfigured()) {
      return this.getMockStories(limit);
    }

    try {
      const response = await axios.get(`${this.apiBase}/me/stories`, {
        params: {
          fields: 'id,media_type,media_url,permalink,timestamp,username,replies_count,likes_count',
          limit,
          access_token: this.accessToken
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Instagram API Error:', error.message);
      return this.getMockStories(limit);
    }
  }

  /**
   * Transform Instagram profile to standard format
   */
  transformProfile(data) {
    return {
      platform: 'instagram',
      userId: data.id,
      username: data.username || 'instagram_user',
      displayName: data.name || data.username,
      bio: data.biography || '',
      website: data.website || '',
      avatar: data.profile_picture_url,
      followers: data.followers_count || 0,
      following: data.follows_count || 0,
      posts: data.media_count || 0,
      accountType: data.account_type || 'PERSONAL',
      profileUrl: `https://www.instagram.com/${data.username}`,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Transform Instagram media to standard format
   */
  transformMedia(items) {
    return items.map(item => {
      const likes = item.like_count || 0;
      const comments = item.comments_count || 0;
      const isVideo = item.media_type === 'VIDEO';
      const views = isVideo ? (item.video_view_count || 0) : 0;

      return {
        id: item.id,
        platform: 'instagram',
        type: item.media_type.toLowerCase(),
        caption: item.caption || '',
        mediaUrl: item.media_url,
        thumbnail: item.thumbnail_url || item.media_url,
        permalink: item.permalink,
        username: item.username,
        publishedAt: item.timestamp,
        likes,
        comments,
        views,
        children: item.children?.data || [],
        engagement: views > 0 ? ((likes + comments) / views * 100).toFixed(2) : ((likes + comments) / (views || 1) * 100).toFixed(2)
      };
    });
  }

  /**
   * Transform media details
   */
  transformMediaDetails(data) {
    const likes = data.like_count || 0;
    const comments = data.comments_count || 0;
    const isVideo = data.media_type === 'VIDEO';
    const views = isVideo ? (data.video_view_count || 0) : 0;

    return {
      id: data.id,
      platform: 'instagram',
      type: data.media_type.toLowerCase(),
      caption: data.caption || '',
      mediaUrl: data.media_url,
      thumbnail: data.thumbnail_url || data.media_url,
      permalink: data.permalink,
      username: data.username,
      publishedAt: data.timestamp,
      likes,
      comments,
      views,
      children: data.children?.data || [],
      engagement: views > 0 ? ((likes + comments) / views * 100).toFixed(2) : ((likes + comments) / (views || 1) * 100).toFixed(2)
    };
  }

  /**
   * Transform insights data
   */
  transformInsights(data) {
    const insights = {};
    data.forEach(item => {
      insights[item.name] = item.values[0]?.value || 0;
    });
    return insights;
  }

  /**
   * Generate mock profile for development
   */
  getMockProfile(userId) {
    return {
      platform: 'instagram',
      userId: userId || 'mock_ig_user_id',
      username: 'mock_creator',
      displayName: 'Mock Instagram Creator',
      bio: 'Creating content and having fun! 🎨✨',
      website: 'https://example.com',
      avatar: 'https://scontent.cdninstagram.com/mock_avatar.jpg',
      followers: Math.floor(Math.random() * 100000) + 1000,
      following: Math.floor(Math.random() * 2000) + 100,
      posts: Math.floor(Math.random() * 500) + 10,
      accountType: 'CREATOR',
      profileUrl: 'https://www.instagram.com/mock_creator',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate mock media for development
   */
  getMockMedia(count = 25) {
    const media = [];
    const now = Date.now();
    const types = ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const isVideo = type === 'VIDEO';
      const views = isVideo ? Math.floor(Math.random() * 100000) + 1000 : 0;
      const likes = Math.floor(Math.random() * 10000) + 100;
      const comments = Math.floor(Math.random() * 500) + 10;
      
      media.push({
        id: `ig_media_${i + 1}`,
        platform: 'instagram',
        type: type.toLowerCase(),
        caption: `Amazing content #${i + 1} 🌟 #creative #lifestyle`,
        mediaUrl: `https://scontent.cdninstagram.com/mock_media_${i + 1}.jpg`,
        thumbnail: `https://scontent.cdninstagram.com/mock_thumb_${i + 1}.jpg`,
        permalink: `https://www.instagram.com/p/mock_${i + 1}/`,
        username: 'mock_creator',
        publishedAt: new Date(now - i * 86400000 * 2).toISOString(),
        likes,
        comments,
        views,
        children: [],
        engagement: ((likes + comments) / (views || 1) * 100).toFixed(2)
      });
    }
    
    return media;
  }

  /**
   * Generate mock media details for development
   */
  getMockMediaDetails(mediaId) {
    const views = Math.floor(Math.random() * 100000) + 1000;
    const likes = Math.floor(Math.random() * 10000) + 100;
    const comments = Math.floor(Math.random() * 500) + 10;

    return {
      id: mediaId || 'mock_ig_media',
      platform: 'instagram',
      type: 'image',
      caption: 'Mock Instagram post caption for development.',
      mediaUrl: 'https://scontent.cdninstagram.com/mock_media.jpg',
      thumbnail: 'https://scontent.cdninstagram.com/mock_thumb.jpg',
      permalink: 'https://www.instagram.com/p/mock_media/',
      username: 'mock_creator',
      publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      likes,
      comments,
      views,
      children: [],
      engagement: ((likes + comments) / (views || 1) * 100).toFixed(2)
    };
  }

  /**
   * Generate mock media insights for development
   */
  getMockMediaInsights(mediaId) {
    const reach = Math.floor(Math.random() * 50000) + 1000;
    const impressions = Math.floor(reach * (Math.random() * 0.5 + 1));

    return {
      mediaId,
      platform: 'instagram',
      reach,
      impressions,
      saved: Math.floor(Math.random() * 1000) + 50,
      engagement: (Math.random() * 10 + 2).toFixed(2),
      videoViews: Math.floor(Math.random() * 50000),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate mock insights for development
   */
  getMockInsights(period = '28d') {
    return {
      period,
      platform: 'instagram',
      followers: Math.floor(Math.random() * 5000) + 500,
      followerDelta: Math.floor(Math.random() * 500) - 100,
      reach: Math.floor(Math.random() * 100000) + 10000,
      impressions: Math.floor(Math.random() * 300000) + 30000,
      engagement: (Math.random() * 5 + 1).toFixed(2),
      profileViews: Math.floor(Math.random() * 10000) + 1000,
      websiteClicks: Math.floor(Math.random() * 500) + 50,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate mock stories for development
   */
  getMockStories(count = 10) {
    const stories = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      stories.push({
        id: `ig_story_${i + 1}`,
        platform: 'instagram',
        media_type: i % 2 === 0 ? 'IMAGE' : 'VIDEO',
        media_url: `https://scontent.cdninstagram.com/mock_story_${i + 1}.jpg`,
        permalink: `https://www.instagram.com/stories/mock_creator/${i + 1}/`,
        timestamp: new Date(now - i * 3600000).toISOString(),
        username: 'mock_creator',
        views: Math.floor(Math.random() * 5000) + 100,
        replies: Math.floor(Math.random() * 50),
        likes: Math.floor(Math.random() * 100)
      });
    }

    return stories;
  }
}

module.exports = InstagramPlatform;
