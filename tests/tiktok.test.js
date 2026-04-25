/**
 * TikTok Platform Tests
 */

const TikTokPlatform = require('../src/platforms/tiktok');

describe('TikTokPlatform', () => {
  let platform;

  beforeEach(() => {
    platform = new TikTokPlatform({
      clientKey: 'test_key',
      clientSecret: 'test_secret',
      accessToken: 'test_token'
    });
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      const configPlatform = new TikTokPlatform({
        clientKey: 'key1',
        clientSecret: 'secret1',
        accessToken: 'token1'
      });
      expect(configPlatform.clientKey).toBe('key1');
    });

    it('should use environment variables when no config provided', () => {
      process.env.TIKTOK_CLIENT_KEY = 'env_key';
      process.env.TIKTOK_CLIENT_SECRET = 'env_secret';
      process.env.TIKTOK_ACCESS_TOKEN = 'env_token';
      
      const envPlatform = new TikTokPlatform();
      expect(envPlatform.clientKey).toBe('env_key');
      
      delete process.env.TIKTOK_CLIENT_KEY;
      delete process.env.TIKTOK_CLIENT_SECRET;
      delete process.env.TIKTOK_ACCESS_TOKEN;
    });
  });

  describe('isConfigured', () => {
    it('should return true when all credentials are present', () => {
      expect(platform.isConfigured()).toBe(true);
    });

    it('should return false when credentials are missing', () => {
      const incompletePlatform = new TikTokPlatform();
      expect(incompletePlatform.isConfigured()).toBe(false);
    });
  });

  describe('getHeaders', () => {
    it('should return authorization header', () => {
      const headers = platform.getHeaders();
      expect(headers.Authorization).toBe('Bearer test_token');
      expect(headers['Content-Type']).toBe('application/json');
    });
  });

  describe('getProfile', () => {
    it('should return mock profile when not configured', async () => {
      const unconfiguredPlatform = new TikTokPlatform();
      const profile = await unconfiguredPlatform.getProfile();
      
      expect(profile).toHaveProperty('platform', 'tiktok');
      expect(profile).toHaveProperty('username');
      expect(profile).toHaveProperty('followers');
      expect(profile).toHaveProperty('lastUpdated');
    });
  });

  describe('getVideos', () => {
    it('should return mock videos when not configured', async () => {
      const unconfiguredPlatform = new TikTokPlatform();
      const videos = await unconfiguredPlatform.getVideos(5);
      
      expect(Array.isArray(videos)).toBe(true);
      expect(videos.length).toBeLessThanOrEqual(5);
      videos.forEach(video => {
        expect(video).toHaveProperty('platform', 'tiktok');
        expect(video).toHaveProperty('title');
        expect(video).toHaveProperty('views');
        expect(video).toHaveProperty('likes');
      });
    });

    it('should respect limit parameter', async () => {
      const unconfiguredPlatform = new TikTokPlatform();
      const videos = await unconfiguredPlatform.getVideos(3);
      expect(videos.length).toBe(3);
    });
  });

  describe('getAnalytics', () => {
    it('should return mock analytics when not configured', async () => {
      const unconfiguredPlatform = new TikTokPlatform();
      const analytics = await unconfiguredPlatform.getAnalytics('7d');
      
      expect(analytics).toHaveProperty('platform', 'tiktok');
      expect(analytics).toHaveProperty('period', '7d');
      expect(analytics).toHaveProperty('metrics');
      expect(analytics).toHaveProperty('lastUpdated');
    });

    it('should handle different period values', async () => {
      const unconfiguredPlatform = new TikTokPlatform();
      
      const analytics7d = await unconfiguredPlatform.getAnalytics('7d');
      const analytics30d = await unconfiguredPlatform.getAnalytics('30d');
      
      expect(analytics7d.period).toBe('7d');
      expect(analytics30d.period).toBe('30d');
    });
  });

  describe('transformProfile', () => {
    it('should transform TikTok profile data correctly', () => {
      const tiktokData = {
        open_id: '123456',
        display_name: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
        followers_count: 1000,
        following_count: 500,
        likes_count: 5000,
        is_verified: true
      };

      const profile = platform.transformProfile(tiktokData);

      expect(profile.platform).toBe('tiktok');
      expect(profile.username).toBe('testuser');
      expect(profile.avatar).toBe('https://example.com/avatar.jpg');
      expect(profile.followers).toBe(1000);
      expect(profile.following).toBe(500);
      expect(profile.likes).toBe(5000);
      expect(profile.verified).toBe(true);
    });

    it('should handle missing fields gracefully', () => {
      const minimalData = {};
      const profile = platform.transformProfile(minimalData);

      expect(profile.platform).toBe('tiktok');
      expect(profile.username).toBe('creator');
      expect(profile.displayName).toBe('TikTok Creator');
    });
  });

  describe('transformVideos', () => {
    it('should transform video data correctly', () => {
      const videos = [{
        id: 'video123',
        title: 'Test Video',
        cover_image_url: 'https://example.com/thumb.jpg',
        share_url: 'https://tiktok.com/@user/video/123',
        view_count: 1000,
        like_count: 100,
        comment_count: 20,
        share_count: 10,
        create_time: 1700000000
      }];

      const transformed = platform.transformVideos(videos);

      expect(transformed[0].id).toBe('video123');
      expect(transformed[0].platform).toBe('tiktok');
      expect(transformed[0].title).toBe('Test Video');
      expect(transformed[0].thumbnail).toBe('https://example.com/thumb.jpg');
      expect(transformed[0].views).toBe(1000);
      expect(transformed[0].likes).toBe(100);
    });
  });

  describe('calculateEngagement', () => {
    it('should calculate engagement rate correctly', () => {
      const video = {
        view_count: 1000,
        like_count: 100,
        comment_count: 20,
        share_count: 10
      };

      const engagement = platform.calculateEngagement(video);
      expect(parseFloat(engagement)).toBeCloseTo(13, 0);
    });

    it('should handle zero views', () => {
      const video = { view_count: 0, like_count: 0, comment_count: 0, share_count: 0 };
      const engagement = platform.calculateEngagement(video);
      expect(engagement).toBe('0.00');
    });
  });

  describe('getMockVideoAnalytics', () => {
    it('should return video analytics with expected structure', () => {
      const analytics = platform.getMockVideoAnalytics('test_video_id');

      expect(analytics).toHaveProperty('platform', 'tiktok');
      expect(analytics).toHaveProperty('videoId', 'test_video_id');
      expect(analytics).toHaveProperty('metrics');
      expect(analytics.metrics).toHaveProperty('views');
      expect(analytics.metrics).toHaveProperty('engagementRate');
      expect(analytics.metrics).toHaveProperty('averageWatchTime');
    });
  });
});
