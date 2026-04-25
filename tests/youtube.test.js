/**
 * YouTube Platform Tests
 */

const YouTubePlatform = require('../src/platforms/youtube');

describe('YouTubePlatform', () => {
  let platform;

  beforeEach(() => {
    platform = new YouTubePlatform({
      apiKey: 'test_api_key'
    });
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      const configPlatform = new YouTubePlatform({
        apiKey: 'my_api_key'
      });
      expect(configPlatform.apiKey).toBe('my_api_key');
    });

    it('should use environment variables when no config provided', () => {
      process.env.YOUTUBE_API_KEY = 'env_api_key';
      
      const envPlatform = new YouTubePlatform();
      expect(envPlatform.apiKey).toBe('env_api_key');
      
      delete process.env.YOUTUBE_API_KEY;
    });
  });

  describe('isConfigured', () => {
    it('should return true when API key is present', () => {
      expect(platform.isConfigured()).toBe(true);
    });

    it('should return false when API key is missing', () => {
      const unconfiguredPlatform = new YouTubePlatform();
      expect(unconfiguredPlatform.isConfigured()).toBe(false);
    });
  });

  describe('setChannelId', () => {
    it('should set channel ID and return platform for chaining', () => {
      const result = platform.setChannelId('UC123456');
      expect(result).toBe(platform);
      expect(platform.channelId).toBe('UC123456');
    });
  });

  describe('getProfile', () => {
    it('should return mock profile when not configured', async () => {
      const unconfiguredPlatform = new YouTubePlatform();
      const profile = await unconfiguredPlatform.getProfile('UC123');
      
      expect(profile).toHaveProperty('platform', 'youtube');
      expect(profile).toHaveProperty('channelId');
      expect(profile).toHaveProperty('displayName');
      expect(profile).toHaveProperty('subscribers');
    });
  });

  describe('getVideos', () => {
    it('should return mock videos when not configured', async () => {
      const unconfiguredPlatform = new YouTubePlatform();
      const videos = await unconfiguredPlatform.getVideos('UC123', 5);
      
      expect(Array.isArray(videos)).toBe(true);
      expect(videos.length).toBeLessThanOrEqual(5);
      videos.forEach(video => {
        expect(video).toHaveProperty('platform', 'youtube');
        expect(video).toHaveProperty('title');
        expect(video).toHaveProperty('views');
      });
    });
  });

  describe('searchVideos', () => {
    it('should return mock videos for search', async () => {
      const videos = await platform.searchVideos('test query', 5);
      
      expect(Array.isArray(videos)).toBe(true);
      videos.forEach(video => {
        expect(video).toHaveProperty('platform', 'youtube');
        expect(video).toHaveProperty('id');
        expect(video).toHaveProperty('title');
      });
    });
  });

  describe('transformProfile', () => {
    it('should transform YouTube channel data correctly', () => {
      const channelData = {
        id: 'UC123456',
        snippet: {
          title: 'Test Channel',
          description: 'A test channel',
          customUrl: '@testchannel',
          thumbnails: {
            high: { url: 'https://example.com/avatar.jpg' }
          },
          country: 'US',
          publishedAt: '2020-01-01T00:00:00Z'
        },
        statistics: {
          subscriberCount: '10000',
          videoCount: '100',
          viewCount: '500000'
        },
        brandingSettings: {
          channel: {
            title: 'Test Channel'
          }
        }
      };

      const profile = platform.transformProfile(channelData);

      expect(profile.platform).toBe('youtube');
      expect(profile.channelId).toBe('UC123456');
      expect(profile.displayName).toBe('Test Channel');
      expect(profile.subscribers).toBe(10000);
      expect(profile.videos).toBe(100);
      expect(profile.views).toBe(500000);
      expect(profile.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should handle missing statistics', () => {
      const channelData = {
        id: 'UC123',
        snippet: { title: 'Test' }
      };

      const profile = platform.transformProfile(channelData);

      expect(profile.subscribers).toBe(0);
      expect(profile.videos).toBe(0);
      expect(profile.views).toBe(0);
    });
  });

  describe('transformVideos', () => {
    it('should transform playlist items correctly', () => {
      const items = [{
        contentDetails: { videoId: 'video123' },
        snippet: {
          title: 'Test Video',
          description: 'Video description',
          thumbnails: { high: { url: 'https://example.com/thumb.jpg' } },
          channelTitle: 'Test Channel',
          channelId: 'UC123',
          publishedAt: '2024-01-01T00:00:00Z'
        },
        statistics: {
          viewCount: '1000',
          likeCount: '100',
          commentCount: '20'
        }
      }];

      const transformed = platform.transformVideos(items);

      expect(transformed[0].id).toBe('video123');
      expect(transformed[0].title).toBe('Test Video');
      expect(transformed[0].views).toBe(1000);
      expect(transformed[0].url).toBe('https://www.youtube.com/watch?v=video123');
    });
  });

  describe('getMockVideos', () => {
    it('should generate videos with expected structure', () => {
      const videos = platform.getMockVideos(3);

      expect(videos.length).toBe(3);
      videos.forEach(video => {
        expect(video).toHaveProperty('id');
        expect(video).toHaveProperty('platform', 'youtube');
        expect(video).toHaveProperty('title');
        expect(video).toHaveProperty('thumbnail');
        expect(video).toHaveProperty('views');
        expect(video).toHaveProperty('likes');
        expect(video).toHaveProperty('publishedAt');
        expect(video).toHaveProperty('url');
        expect(video.url).toContain('youtube.com');
      });
    });
  });

  describe('getVideo', () => {
    it('should return mock video details when not configured', async () => {
      const unconfiguredPlatform = new YouTubePlatform();
      const video = await unconfiguredPlatform.getVideo('test_video_id');

      expect(video).toHaveProperty('id', 'test_video_id');
      expect(video).toHaveProperty('platform', 'youtube');
      expect(video).toHaveProperty('title');
      expect(video).toHaveProperty('views');
    });
  });

  describe('getMockProfile', () => {
    it('should return profile with expected structure', () => {
      const profile = platform.getMockProfile('UC123');

      expect(profile).toHaveProperty('platform', 'youtube');
      expect(profile).toHaveProperty('channelId', 'UC123');
      expect(profile).toHaveProperty('username');
      expect(profile).toHaveProperty('displayName');
      expect(profile).toHaveProperty('subscribers');
      expect(profile).toHaveProperty('profileUrl');
      expect(profile.subscribers).toBeGreaterThan(0);
    });
  });
});
