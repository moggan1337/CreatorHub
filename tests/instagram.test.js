/**
 * Instagram Platform Tests
 */

const InstagramPlatform = require('../src/platforms/instagram');

describe('InstagramPlatform', () => {
  let platform;

  beforeEach(() => {
    platform = new InstagramPlatform({
      accessToken: 'test_access_token',
      userId: 'test_user_id'
    });
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      const configPlatform = new InstagramPlatform({
        accessToken: 'my_token',
        userId: 'my_user_id'
      });
      expect(configPlatform.accessToken).toBe('my_token');
      expect(configPlatform.userId).toBe('my_user_id');
    });

    it('should use environment variables when no config provided', () => {
      process.env.INSTAGRAM_ACCESS_TOKEN = 'env_token';
      
      const envPlatform = new InstagramPlatform();
      expect(envPlatform.accessToken).toBe('env_token');
      
      delete process.env.INSTAGRAM_ACCESS_TOKEN;
    });
  });

  describe('isConfigured', () => {
    it('should return true when access token is present', () => {
      expect(platform.isConfigured()).toBe(true);
    });

    it('should return false when access token is missing', () => {
      const unconfiguredPlatform = new InstagramPlatform();
      expect(unconfiguredPlatform.isConfigured()).toBe(false);
    });
  });

  describe('setUserId', () => {
    it('should set user ID and return platform for chaining', () => {
      const result = platform.setUserId('ig_user_123');
      expect(result).toBe(platform);
      expect(platform.userId).toBe('ig_user_123');
    });
  });

  describe('getProfile', () => {
    it('should return mock profile when not configured', async () => {
      const unconfiguredPlatform = new InstagramPlatform();
      const profile = await unconfiguredPlatform.getProfile();
      
      expect(profile).toHaveProperty('platform', 'instagram');
      expect(profile).toHaveProperty('username');
      expect(profile).toHaveProperty('followers');
      expect(profile).toHaveProperty('posts');
    });
  });

  describe('getMedia', () => {
    it('should return mock media when not configured', async () => {
      const unconfiguredPlatform = new InstagramPlatform();
      const media = await unconfiguredPlatform.getMedia(5);
      
      expect(Array.isArray(media)).toBe(true);
      expect(media.length).toBeLessThanOrEqual(5);
      media.forEach(item => {
        expect(item).toHaveProperty('platform', 'instagram');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('likes');
      });
    });

    it('should respect limit parameter', async () => {
      const unconfiguredPlatform = new InstagramPlatform();
      const media = await unconfiguredPlatform.getMedia(3);
      expect(media.length).toBe(3);
    });
  });

  describe('getInsights', () => {
    it('should return mock insights when not configured', async () => {
      const unconfiguredPlatform = new InstagramPlatform();
      const insights = await unconfiguredPlatform.getInsights('28d');
      
      expect(insights).toHaveProperty('period', '28d');
      expect(insights).toHaveProperty('platform', 'instagram');
      expect(insights).toHaveProperty('followers');
    });

    it('should handle different period values', async () => {
      const unconfiguredPlatform = new InstagramPlatform();
      
      const insights28d = await unconfiguredPlatform.getInsights('28d');
      const insights7d = await unconfiguredPlatform.getInsights('7d');
      
      expect(insights28d.period).toBe('28d');
      expect(insights7d.period).toBe('7d');
    });
  });

  describe('transformProfile', () => {
    it('should transform Instagram profile data correctly', () => {
      const igData = {
        id: '123456',
        username: 'testuser',
        name: 'Test User',
        biography: 'Test bio',
        website: 'https://example.com',
        profile_picture_url: 'https://example.com/avatar.jpg',
        followers_count: 5000,
        follows_count: 500,
        media_count: 100,
        account_type: 'BUSINESS'
      };

      const profile = platform.transformProfile(igData);

      expect(profile.platform).toBe('instagram');
      expect(profile.userId).toBe('123456');
      expect(profile.username).toBe('testuser');
      expect(profile.displayName).toBe('Test User');
      expect(profile.followers).toBe(5000);
      expect(profile.following).toBe(500);
      expect(profile.posts).toBe(100);
      expect(profile.accountType).toBe('BUSINESS');
    });

    it('should handle missing fields gracefully', () => {
      const minimalData = { id: '123' };
      const profile = platform.transformProfile(minimalData);

      expect(profile.platform).toBe('instagram');
      expect(profile.username).toBe('instagram_user');
    });
  });

  describe('transformMedia', () => {
    it('should transform media items correctly', () => {
      const items = [{
        id: 'media123',
        caption: 'Test caption',
        media_type: 'IMAGE',
        media_url: 'https://example.com/image.jpg',
        permalink: 'https://instagram.com/p/media123/',
        timestamp: '2024-01-01T00:00:00Z',
        username: 'testuser',
        like_count: 100,
        comments_count: 20
      }];

      const transformed = platform.transformMedia(items);

      expect(transformed[0].id).toBe('media123');
      expect(transformed[0].type).toBe('image');
      expect(transformed[0].caption).toBe('Test caption');
      expect(transformed[0].likes).toBe(100);
      expect(transformed[0].comments).toBe(20);
      expect(transformed[0].permalink).toBe('https://instagram.com/p/media123/');
    });

    it('should handle video media type', () => {
      const items = [{
        id: 'video123',
        media_type: 'VIDEO',
        media_url: 'https://example.com/video.mp4',
        thumbnail_url: 'https://example.com/thumb.jpg',
        permalink: 'https://instagram.com/p/video123/',
        timestamp: '2024-01-01T00:00:00Z',
        username: 'testuser',
        video_view_count: 1000,
        like_count: 200,
        comments_count: 30
      }];

      const transformed = platform.transformMedia(items);

      expect(transformed[0].type).toBe('video');
      expect(transformed[0].views).toBe(1000);
    });

    it('should handle carousel media type', () => {
      const items = [{
        id: 'carousel123',
        media_type: 'CAROUSEL_ALBUM',
        media_url: 'https://example.com/carousel.jpg',
        permalink: 'https://instagram.com/p/carousel123/',
        timestamp: '2024-01-01T00:00:00Z',
        username: 'testuser',
        like_count: 150,
        comments_count: 25,
        children: {
          data: [
            { media_url: 'https://example.com/1.jpg', media_type: 'IMAGE' },
            { media_url: 'https://example.com/2.jpg', media_type: 'IMAGE' }
          ]
        }
      }];

      const transformed = platform.transformMedia(items);

      expect(transformed[0].type).toBe('carousel_album');
      expect(transformed[0].children).toHaveLength(2);
    });
  });

  describe('getMockMedia', () => {
    it('should generate media with expected structure', () => {
      const media = platform.getMockMedia(3);

      expect(media.length).toBe(3);
      media.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('platform', 'instagram');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('likes');
        expect(item).toHaveProperty('comments');
        expect(item).toHaveProperty('publishedAt');
        expect(item).toHaveProperty('permalink');
        expect(item.permalink).toContain('instagram.com');
      });
    });
  });

  describe('getStories', () => {
    it('should return mock stories when not configured', async () => {
      const unconfiguredPlatform = new InstagramPlatform();
      const stories = await unconfiguredPlatform.getStories(5);
      
      expect(Array.isArray(stories)).toBe(true);
      expect(stories.length).toBeLessThanOrEqual(5);
      stories.forEach(story => {
        expect(story).toHaveProperty('platform', 'instagram');
      });
    });
  });

  describe('getMockInsights', () => {
    it('should return insights with expected structure', () => {
      const insights = platform.getMockInsights('28d');

      expect(insights).toHaveProperty('period', '28d');
      expect(insights).toHaveProperty('platform', 'instagram');
      expect(insights).toHaveProperty('followers');
      expect(insights).toHaveProperty('reach');
      expect(insights).toHaveProperty('engagement');
    });
  });
});
