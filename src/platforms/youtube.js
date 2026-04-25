/**
 * YouTube Data API Integration
 * 
 * This module provides integration with YouTube Data API v3.
 * Requires a YouTube Data API key from Google Cloud Console.
 */

const axios = require('axios');

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

class YouTubePlatform {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.YOUTUBE_API_KEY;
    this.channelId = config.channelId || null;
    this.apiBase = YOUTUBE_API_BASE;
  }

  /**
   * Check if the platform is properly configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Set the channel ID
   */
  setChannelId(channelId) {
    this.channelId = channelId;
    return this;
  }

  /**
   * Get channel ID from handle or username
   */
  async resolveChannelId(handle) {
    if (!this.isConfigured()) {
      return 'UC_mock_channel_id';
    }

    try {
      const searchHandle = handle.startsWith('@') ? handle : `@${handle}`;
      const response = await axios.get(`${this.apiBase}/channels`, {
        params: {
          part: 'id',
          forHandle: searchHandle,
          key: this.apiKey
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0].id;
      }
      return null;
    } catch (error) {
      console.error('YouTube API Error:', error.message);
      return 'UC_mock_channel_id';
    }
  }

  /**
   * Fetch channel profile information
   */
  async getProfile(channelId = null) {
    const targetChannelId = channelId || this.channelId;

    if (!this.isConfigured()) {
      return this.getMockProfile(targetChannelId);
    }

    try {
      const response = await axios.get(`${this.apiBase}/channels`, {
        params: {
          part: 'snippet,statistics,brandingSettings',
          id: targetChannelId,
          key: this.apiKey
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        return this.transformProfile(response.data.items[0]);
      }
      return this.getMockProfile(targetChannelId);
    } catch (error) {
      console.error('YouTube API Error:', error.message);
      return this.getMockProfile(targetChannelId);
    }
  }

  /**
   * Fetch channel's videos
   */
  async getVideos(channelId = null, maxResults = 20) {
    const targetChannelId = channelId || this.channelId;

    if (!this.isConfigured() || !targetChannelId) {
      return this.getMockVideos(maxResults);
    }

    try {
      // First get the uploads playlist ID
      const channelResponse = await axios.get(`${this.apiBase}/channels`, {
        params: {
          part: 'contentDetails',
          id: targetChannelId,
          key: this.apiKey
        }
      });

      const uploadsPlaylistId = channelResponse.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
      
      if (!uploadsPlaylistId) {
        return this.getMockVideos(maxResults);
      }

      // Then get the videos from the uploads playlist
      const videosResponse = await axios.get(`${this.apiBase}/playlistItems`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          playlistId: uploadsPlaylistId,
          maxResults,
          key: this.apiKey
        }
      });

      return this.transformVideos(videosResponse.data.items || []);
    } catch (error) {
      console.error('YouTube API Error:', error.message);
      return this.getMockVideos(maxResults);
    }
  }

  /**
   * Search for videos
   */
  async searchVideos(query, maxResults = 20) {
    if (!this.isConfigured()) {
      return this.getMockVideos(maxResults);
    }

    try {
      const response = await axios.get(`${this.apiBase}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults,
          key: this.apiKey
        }
      });

      const videoIds = response.data.items.map(item => item.id.videoId).join(',');

      // Get statistics for the videos
      const statsResponse = await axios.get(`${this.apiBase}/videos`, {
        params: {
          part: 'statistics,contentDetails',
          id: videoIds,
          key: this.apiKey
        }
      });

      const statsMap = {};
      statsResponse.data.items.forEach(item => {
        statsMap[item.id] = item;
      });

      return response.data.items.map(item => ({
        id: item.id.videoId,
        platform: 'youtube',
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        views: statsMap[item.id.videoId]?.statistics?.viewCount || 0,
        likes: statsMap[item.id.videoId]?.statistics?.likeCount || 0,
        comments: statsMap[item.id.videoId]?.statistics?.commentCount || 0,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
    } catch (error) {
      console.error('YouTube API Error:', error.message);
      return this.getMockVideos(maxResults);
    }
  }

  /**
   * Get video details
   */
  async getVideo(videoId) {
    if (!this.isConfigured()) {
      return this.getMockVideoDetails(videoId);
    }

    try {
      const response = await axios.get(`${this.apiBase}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          key: this.apiKey
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        return this.transformVideoDetails(response.data.items[0]);
      }
      return this.getMockVideoDetails(videoId);
    } catch (error) {
      console.error('YouTube API Error:', error.message);
      return this.getMockVideoDetails(videoId);
    }
  }

  /**
   * Transform YouTube channel to standard format
   */
  transformProfile(channel) {
    const snippet = channel.snippet || {};
    const statistics = channel.statistics || {};
    const branding = channel.brandingSettings?.channel || {};

    return {
      platform: 'youtube',
      channelId: channel.id,
      username: snippet.customUrl?.replace('@', '') || channel.id,
      displayName: snippet.title || 'YouTube Channel',
      description: snippet.description || '',
      avatar: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url,
      banner: branding.image?.bannerExternalUrl || null,
      subscribers: parseInt(statistics.subscriberCount) || 0,
      videos: parseInt(statistics.videoCount) || 0,
      views: parseInt(statistics.viewCount) || 0,
      profileUrl: `https://www.youtube.com/channel/${channel.id}`,
      customUrl: snippet.customUrl || null,
      country: snippet.country || null,
      createdAt: snippet.publishedAt || null,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Transform YouTube playlist items to standard video format
   */
  transformVideos(items) {
    return items.map(item => ({
      id: item.contentDetails.videoId || item.snippet.resourceId?.videoId,
      platform: 'youtube',
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      views: parseInt(item.statistics?.viewCount) || 0,
      likes: parseInt(item.statistics?.likeCount) || 0,
      comments: parseInt(item.statistics?.commentCount) || 0,
      url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId || item.snippet.resourceId?.videoId}`
    }));
  }

  /**
   * Transform video details
   */
  transformVideoDetails(video) {
    const stats = video.statistics || {};
    const views = parseInt(stats.viewCount) || 0;
    const likes = parseInt(stats.likeCount) || 0;
    const comments = parseInt(stats.commentCount) || 0;

    return {
      id: video.id,
      platform: 'youtube',
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails?.high?.url,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      publishedAt: video.snippet.publishedAt,
      views,
      likes,
      comments,
      duration: video.contentDetails?.duration || '',
      url: `https://www.youtube.com/watch?v=${video.id}`,
      engagement: views > 0 ? ((likes + comments) / views * 100).toFixed(2) : '0.00'
    };
  }

  /**
   * Generate mock profile for development
   */
  getMockProfile(channelId) {
    return {
      platform: 'youtube',
      channelId: channelId || 'UC_mock_channel_id',
      username: 'mock_creator',
      displayName: 'Mock YouTube Creator',
      description: 'This is a mock YouTube channel for development purposes.',
      avatar: 'https://yt3.ggpht.com/mock_avatar',
      banner: null,
      subscribers: Math.floor(Math.random() * 1000000) + 10000,
      videos: Math.floor(Math.random() * 500) + 10,
      views: Math.floor(Math.random() * 100000000) + 100000,
      profileUrl: `https://www.youtube.com/channel/${channelId || 'UC_mock_channel_id'}`,
      customUrl: '@mockcreator',
      country: 'US',
      createdAt: '2020-01-01T00:00:00Z',
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
      const views = Math.floor(Math.random() * 1000000) + 10000;
      const likes = Math.floor(views * (Math.random() * 0.05 + 0.01));
      const comments = Math.floor(views * (Math.random() * 0.005 + 0.0005));
      
      videos.push({
        id: `youtube_video_${i + 1}`,
        platform: 'youtube',
        title: `Amazing Video #${i + 1} 🎬`,
        description: 'This is a mock video description for development.',
        thumbnail: `https://img.youtube.com/vi/mock_${i + 1}/hqdefault.jpg`,
        channelTitle: 'Mock YouTube Creator',
        channelId: 'UC_mock_channel_id',
        publishedAt: new Date(now - i * 86400000 * 3).toISOString(),
        views,
        likes,
        comments,
        url: `https://www.youtube.com/watch?v=mock_video_${i + 1}`,
        engagement: ((likes + comments) / views * 100).toFixed(2)
      });
    }
    
    return videos;
  }

  /**
   * Generate mock video details for development
   */
  getMockVideoDetails(videoId) {
    const views = Math.floor(Math.random() * 1000000) + 10000;
    const likes = Math.floor(views * (Math.random() * 0.05 + 0.01));
    const comments = Math.floor(views * (Math.random() * 0.005 + 0.0005));

    return {
      id: videoId || 'mock_video',
      platform: 'youtube',
      title: 'Mock YouTube Video',
      description: 'This is mock video content for development.',
      thumbnail: 'https://img.youtube.com/vi/mock_video/hqdefault.jpg',
      channelTitle: 'Mock YouTube Creator',
      channelId: 'UC_mock_channel_id',
      publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      views,
      likes,
      comments,
      duration: 'PT15M30S',
      url: `https://www.youtube.com/watch?v=${videoId || 'mock_video'}`,
      engagement: ((likes + comments) / views * 100).toFixed(2)
    };
  }
}

module.exports = YouTubePlatform;
