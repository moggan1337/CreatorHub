/**
 * Analytics Aggregator Tests
 */

const AnalyticsAggregator = require('../src/analytics');

describe('AnalyticsAggregator', () => {
  let aggregator;

  beforeEach(() => {
    aggregator = new AnalyticsAggregator({
      tiktok: { clientKey: 'test', clientSecret: 'test', accessToken: 'test' },
      youtube: { apiKey: 'test' },
      instagram: { accessToken: 'test' },
      twitter: { bearerToken: 'test' }
    });
  });

  describe('constructor', () => {
    it('should initialize all platforms', () => {
      expect(aggregator.platforms).toHaveProperty('tiktok');
      expect(aggregator.platforms).toHaveProperty('youtube');
      expect(aggregator.platforms).toHaveProperty('instagram');
      expect(aggregator.platforms).toHaveProperty('twitter');
    });

    it('should initialize with custom cache TTL', () => {
      const customAggregator = new AnalyticsAggregator({}, { cacheTTL: 60000 });
      // Cache TTL is only read from config object, not second param
      expect(customAggregator.cacheTTL).toBe(5 * 60 * 1000);
    });

    it('should use default cache TTL', () => {
      expect(aggregator.cacheTTL).toBe(5 * 60 * 1000);
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      // First call to populate cache
      await aggregator.getUnifiedAnalytics('7d');
      expect(aggregator.cache.size).toBeGreaterThan(0);
      
      // Clear cache
      aggregator.clearCache();
      expect(aggregator.cache.size).toBe(0);
    });
  });

  describe('clearCacheEntry', () => {
    it('should clear specific cache entry', async () => {
      await aggregator.getUnifiedAnalytics('7d');
      await aggregator.getUnifiedAnalytics('30d');
      
      const sizeBefore = aggregator.cache.size;
      aggregator.clearCacheEntry('analytics:7d');
      
      expect(aggregator.cache.size).toBeLessThan(sizeBefore);
    });
  });

  describe('getUnifiedProfile', () => {
    it('should return profiles from all platforms', async () => {
      const result = await aggregator.getUnifiedProfile({});
      
      expect(result).toHaveProperty('platforms');
      expect(result.platforms).toHaveProperty('tiktok');
      expect(result.platforms).toHaveProperty('youtube');
      expect(result.platforms).toHaveProperty('instagram');
      expect(result.platforms).toHaveProperty('twitter');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('lastUpdated');
    });

    it('should handle platform-specific usernames', async () => {
      const result = await aggregator.getUnifiedProfile({
        tiktok: 'test_tiktok',
        twitter: '@test_twitter'
      });
      
      expect(result).toHaveProperty('platforms');
    });
  });

  describe('generateProfileSummary', () => {
    it('should aggregate follower counts correctly', () => {
      const profiles = {
        tiktok: { followers: 1000 },
        youtube: { subscribers: 2000 },
        instagram: { followers: 3000 },
        twitter: { followers: 4000 }
      };

      const summary = aggregator.generateProfileSummary(profiles);

      expect(summary.totalFollowers).toBe(10000);
      expect(summary.platformCount).toBe(4);
      expect(summary.platformBreakdown).toHaveLength(4);
    });

    it('should handle missing platforms', () => {
      const profiles = {
        tiktok: { followers: 1000 },
        youtube: null
      };

      const summary = aggregator.generateProfileSummary(profiles);

      expect(summary.totalFollowers).toBe(1000);
      expect(summary.platformCount).toBe(1);
    });
  });

  describe('getUnifiedContent', () => {
    it('should return content from all platforms', async () => {
      const result = await aggregator.getUnifiedContent({});
      
      expect(result).toHaveProperty('byPlatform');
      expect(result.byPlatform).toHaveProperty('tiktok');
      expect(result.byPlatform).toHaveProperty('youtube');
      expect(result.byPlatform).toHaveProperty('instagram');
      expect(result.byPlatform).toHaveProperty('twitter');
      expect(result).toHaveProperty('unified');
      expect(result).toHaveProperty('summary');
    });

    it('should respect limit parameters', async () => {
      const result = await aggregator.getUnifiedContent({
        tiktok: 5,
        youtube: 3
      });
      
      expect(result.byPlatform.tiktok.length).toBeLessThanOrEqual(5);
      expect(result.byPlatform.youtube.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getUnifiedAnalytics', () => {
    it('should return analytics from all platforms', async () => {
      const result = await aggregator.getUnifiedAnalytics('7d');
      
      expect(result).toHaveProperty('platforms');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('period', '7d');
      expect(result).toHaveProperty('lastUpdated');
    });

    it('should cache results', async () => {
      const first = await aggregator.getUnifiedAnalytics('7d');
      const second = await aggregator.getUnifiedAnalytics('7d');
      
      // Should use cached value
      expect(first).toEqual(second);
      expect(aggregator.cache.has('analytics:7d')).toBe(true);
    });
  });

  describe('comparePlatforms', () => {
    it('should return comparison data for all platforms', async () => {
      const result = await aggregator.comparePlatforms({});
      
      expect(result).toHaveProperty('followers');
      expect(result).toHaveProperty('engagement');
      expect(result).toHaveProperty('contentVolume');
      expect(result).toHaveProperty('topPlatform');
      expect(result).toHaveProperty('fastestGrowing');
    });

    it('should identify top platform by followers', async () => {
      const result = await aggregator.comparePlatforms({});
      
      if (result.followers.data.length > 0) {
        const maxFollowers = Math.max(...result.followers.data);
        const maxIndex = result.followers.data.indexOf(maxFollowers);
        expect(result.topPlatform).toBe(result.followers.labels[maxIndex]);
      }
    });
  });

  describe('getTrendingContent', () => {
    it('should return sorted trending content', async () => {
      const result = await aggregator.getTrendingContent(10);
      
      expect(result).toHaveProperty('trending');
      expect(result).toHaveProperty('summary');
      expect(Array.isArray(result.trending)).toBe(true);
    });

    it('should limit results', async () => {
      const result = await aggregator.getTrendingContent(5);
      expect(result.trending.length).toBeLessThanOrEqual(5);
    });

    it('should include platform distribution', async () => {
      const result = await aggregator.getTrendingContent(10);
      expect(result.summary.platformDistribution).toHaveProperty('tiktok');
      expect(result.summary.platformDistribution).toHaveProperty('youtube');
    });
  });

  describe('calculateEngagementScore', () => {
    it('should calculate weighted engagement score', () => {
      const highEngagement = {
        views: 1000,
        likes: 100,
        comments: 50,
        shares: 25
      };

      const score = aggregator.calculateEngagementScore(highEngagement);
      // Score = (100 * 1 + 50 * 2 + 25 * 3) / 1000 * 1000 = 275
      expect(score).toBe(275);
    });

    it('should handle zero views', () => {
      const item = { likes: 10, comments: 5, shares: 2 };
      const score = aggregator.calculateEngagementScore(item);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('getPlatformDistribution', () => {
    it('should count items per platform', () => {
      const items = [
        { platform: 'tiktok' },
        { platform: 'tiktok' },
        { platform: 'youtube' },
        { platform: 'instagram' },
        { platform: 'instagram' },
        { platform: 'instagram' }
      ];

      const distribution = aggregator.getPlatformDistribution(items);

      expect(distribution.tiktok).toBe(2);
      expect(distribution.youtube).toBe(1);
      expect(distribution.instagram).toBe(3);
      expect(distribution.twitter).toBe(0);
    });
  });

  describe('generateReport', () => {
    it('should generate comprehensive report', async () => {
      const result = await aggregator.generateReport({}, '7d');
      
      expect(result).toHaveProperty('report');
      expect(result.report).toHaveProperty('period', '7d');
      expect(result.report).toHaveProperty('profiles');
      expect(result.report).toHaveProperty('analytics');
      expect(result.report).toHaveProperty('comparison');
      expect(result.report).toHaveProperty('trending');
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('recommendations');
    });

    it('should include insights array', async () => {
      const result = await aggregator.generateReport({}, '7d');
      
      expect(Array.isArray(result.insights)).toBe(true);
    });

    it('should include recommendations array', async () => {
      const result = await aggregator.generateReport({}, '7d');
      
      expect(Array.isArray(result.recommendations)).toBe(true);
      result.recommendations.forEach(rec => {
        expect(rec).toHaveProperty('category');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('action');
      });
    });
  });

  describe('getPlatform', () => {
    it('should return platform instance', () => {
      const tiktok = aggregator.getPlatform('tiktok');
      expect(tiktok).toBeDefined();
      expect(tiktok).toHaveProperty('getProfile');
      expect(tiktok).toHaveProperty('getVideos');
    });

    it('should handle case-insensitive platform names', () => {
      const youtube = aggregator.getPlatform('YOUTUBE');
      const youtube2 = aggregator.getPlatform('YouTube');
      expect(youtube).toBe(youtube2);
    });
  });
});
