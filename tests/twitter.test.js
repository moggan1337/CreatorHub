/**
 * Twitter Platform Tests
 */

const TwitterPlatform = require('../src/platforms/twitter');

describe('TwitterPlatform', () => {
  let platform;

  beforeEach(() => {
    platform = new TwitterPlatform({
      apiKey: 'test_api_key',
      apiSecret: 'test_api_secret',
      bearerToken: 'test_bearer_token',
      accessToken: 'test_access_token',
      accessSecret: 'test_access_secret'
    });
  });

  describe('constructor', () => {
    it('should initialize with config', () => {
      const configPlatform = new TwitterPlatform({
        apiKey: 'my_key',
        apiSecret: 'my_secret',
        bearerToken: 'my_bearer'
      });
      expect(configPlatform.apiKey).toBe('my_key');
      expect(configPlatform.bearerToken).toBe('my_bearer');
    });

    it('should use environment variables when no config provided', () => {
      process.env.TWITTER_BEARER_TOKEN = 'env_bearer';
      
      const envPlatform = new TwitterPlatform();
      expect(envPlatform.bearerToken).toBe('env_bearer');
      
      delete process.env.TWITTER_BEARER_TOKEN;
    });
  });

  describe('isConfigured', () => {
    it('should return true when bearer token is present', () => {
      expect(platform.isConfigured()).toBe(true);
    });

    it('should return true when api key and secret are present', () => {
      const partialPlatform = new TwitterPlatform({
        apiKey: 'key',
        apiSecret: 'secret'
      });
      expect(partialPlatform.isConfigured()).toBe(true);
    });

    it('should return false when no credentials are present', () => {
      const unconfiguredPlatform = new TwitterPlatform();
      expect(unconfiguredPlatform.isConfigured()).toBe(false);
    });
  });

  describe('getBearerHeaders', () => {
    it('should return correct authorization header', () => {
      const headers = platform.getBearerHeaders();
      expect(headers.Authorization).toBe('Bearer test_bearer_token');
      expect(headers['Content-Type']).toBe('application/json');
    });
  });

  describe('getProfile', () => {
    it('should return mock profile when not configured', async () => {
      const unconfiguredPlatform = new TwitterPlatform();
      const profile = await unconfiguredPlatform.getProfile('testuser');
      
      expect(profile).toHaveProperty('platform', 'twitter');
      expect(profile).toHaveProperty('username');
      expect(profile).toHaveProperty('followers');
      expect(profile).toHaveProperty('tweets');
    });

    it('should handle username with @ symbol', async () => {
      const unconfiguredPlatform = new TwitterPlatform();
      const profile = await unconfiguredPlatform.getProfile('@testuser');
      
      expect(profile.username).toBe('testuser');
    });
  });

  describe('getTweets', () => {
    it('should return mock tweets when not configured', async () => {
      const unconfiguredPlatform = new TwitterPlatform();
      const tweets = await unconfiguredPlatform.getTweets('testuser', 5);
      
      expect(Array.isArray(tweets)).toBe(true);
      expect(tweets.length).toBeLessThanOrEqual(5);
      tweets.forEach(tweet => {
        expect(tweet).toHaveProperty('platform', 'twitter');
        expect(tweet).toHaveProperty('text');
        expect(tweet).toHaveProperty('likes');
        expect(tweet).toHaveProperty('retweets');
      });
    });

    it('should respect limit parameter', async () => {
      const unconfiguredPlatform = new TwitterPlatform();
      const tweets = await unconfiguredPlatform.getTweets('testuser', 3);
      expect(tweets.length).toBe(3);
    });
  });

  describe('searchTweets', () => {
    it('should return mock tweets for search query', async () => {
      const tweets = await platform.searchTweets('javascript', 5);
      
      expect(Array.isArray(tweets)).toBe(true);
      tweets.forEach(tweet => {
        expect(tweet).toHaveProperty('platform', 'twitter');
        expect(tweet).toHaveProperty('id');
      });
    });
  });

  describe('transformProfile', () => {
    it('should transform Twitter user data correctly', () => {
      const twitterData = {
        id: '123456',
        username: 'testuser',
        name: 'Test User',
        description: 'Test bio',
        profile_image_url: 'https://example.com/avatar.jpg',
        verified: true,
        created_at: '2020-01-01T00:00:00Z',
        public_metrics: {
          followers_count: 1000,
          following_count: 500,
          tweet_count: 2000,
          listed_count: 50
        },
        entities: {
          url: {
            urls: [{ expanded_url: 'https://example.com' }]
          }
        }
      };

      const profile = platform.transformProfile(twitterData);

      expect(profile.platform).toBe('twitter');
      expect(profile.userId).toBe('123456');
      expect(profile.username).toBe('testuser');
      expect(profile.displayName).toBe('Test User');
      expect(profile.followers).toBe(1000);
      expect(profile.following).toBe(500);
      expect(profile.tweets).toBe(2000);
      expect(profile.verified).toBe(true);
      expect(profile.url).toBe('https://example.com');
    });

    it('should handle missing public metrics', () => {
      const minimalData = { id: '123', username: 'test' };
      const profile = platform.transformProfile(minimalData);

      expect(profile.followers).toBe(0);
      expect(profile.following).toBe(0);
      expect(profile.tweets).toBe(0);
    });
  });

  describe('transformTweets', () => {
    it('should transform tweets correctly', () => {
      const tweets = [{
        id: 'tweet123',
        text: 'Test tweet content',
        author_id: 'user123',
        created_at: '2024-01-01T00:00:00Z',
        source: 'Twitter for iPhone',
        public_metrics: {
          retweet_count: 10,
          like_count: 100,
          reply_count: 5,
          quote_count: 2
        }
      }];

      const users = [{
        id: 'user123',
        username: 'testuser',
        name: 'Test User',
        profile_image_url: 'https://example.com/avatar.jpg'
      }];

      const transformed = platform.transformTweets(tweets, users);

      expect(transformed[0].id).toBe('tweet123');
      expect(transformed[0].text).toBe('Test tweet content');
      expect(transformed[0].authorUsername).toBe('testuser');
      expect(transformed[0].retweets).toBe(10);
      expect(transformed[0].likes).toBe(100);
      expect(transformed[0].source).toBe('Twitter for iPhone');
    });

    it('should handle tweets without matching user', () => {
      const tweets = [{
        id: 'tweet123',
        text: 'Test tweet',
        author_id: 'unknown_user',
        created_at: '2024-01-01T00:00:00Z',
        public_metrics: { retweet_count: 0, like_count: 0, reply_count: 0, quote_count: 0 }
      }];

      const transformed = platform.transformTweets(tweets, []);

      expect(transformed[0].authorUsername).toBe('unknown');
    });
  });

  describe('getMockTweets', () => {
    it('should generate tweets with expected structure', () => {
      const tweets = platform.getMockTweets(3);

      expect(tweets.length).toBe(3);
      tweets.forEach(tweet => {
        expect(tweet).toHaveProperty('id');
        expect(tweet).toHaveProperty('platform', 'twitter');
        expect(tweet).toHaveProperty('text');
        expect(tweet).toHaveProperty('authorUsername');
        expect(tweet).toHaveProperty('retweets');
        expect(tweet).toHaveProperty('likes');
        expect(tweet).toHaveProperty('publishedAt');
        expect(tweet).toHaveProperty('url');
        expect(tweet.url).toContain('twitter.com');
      });
    });

    it('should include engagement calculations', () => {
      const tweets = platform.getMockTweets(1);
      expect(tweets[0]).toHaveProperty('engagement');
      expect(tweets[0]).toHaveProperty('impressions');
    });
  });

  describe('getFollowers', () => {
    it('should return mock followers when not configured', async () => {
      const unconfiguredPlatform = new TwitterPlatform();
      const followers = await unconfiguredPlatform.getFollowers('user123', 10);
      
      expect(Array.isArray(followers)).toBe(true);
      expect(followers.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getFollowing', () => {
    it('should return mock following when not configured', async () => {
      const unconfiguredPlatform = new TwitterPlatform();
      const following = await unconfiguredPlatform.getFollowing('user123', 10);
      
      expect(Array.isArray(following)).toBe(true);
      expect(following.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getTweet', () => {
    it('should return mock tweet details when not configured', async () => {
      const unconfiguredPlatform = new TwitterPlatform();
      const tweet = await unconfiguredPlatform.getTweet('tweet123');

      expect(tweet).toHaveProperty('id', 'tweet123');
      expect(tweet).toHaveProperty('platform', 'twitter');
      expect(tweet).toHaveProperty('text');
    });
  });

  describe('getUserIdByUsername', () => {
    it('should return mock user ID when not configured', async () => {
      const unconfiguredPlatform = new TwitterPlatform();
      const userId = await unconfiguredPlatform.getUserIdByUsername('testuser');
      
      expect(userId).toBe('mock_user_id');
    });
  });

  describe('getMockProfile', () => {
    it('should return profile with expected structure', () => {
      const profile = platform.getMockProfile('testuser');

      expect(profile).toHaveProperty('platform', 'twitter');
      expect(profile).toHaveProperty('username', 'testuser');
      expect(profile).toHaveProperty('displayName');
      expect(profile).toHaveProperty('followers');
      expect(profile).toHaveProperty('profileUrl');
      expect(profile.profileUrl).toContain('twitter.com');
    });
  });
});
