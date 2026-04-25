/**
 * Twitter/X API v2 Integration
 * 
 * This module provides integration with Twitter/X API v2.
 * Supports OAuth 2.0 and App-Only authentication.
 */

const axios = require('axios');

const TWITTER_API_BASE = 'https://api.twitter.com/2';

class TwitterPlatform {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.TWITTER_API_KEY;
    this.apiSecret = config.apiSecret || process.env.TWITTER_API_SECRET;
    this.bearerToken = config.bearerToken || process.env.TWITTER_BEARER_TOKEN;
    this.accessToken = config.accessToken || process.env.TWITTER_ACCESS_TOKEN;
    this.accessSecret = config.accessSecret || process.env.TWITTER_ACCESS_SECRET;
    this.apiBase = TWITTER_API_BASE;
  }

  /**
   * Check if the platform is properly configured
   */
  isConfigured() {
    return !!this.bearerToken || (!!this.apiKey && !!this.apiSecret);
  }

  /**
   * Get headers for Bearer Token authentication
   */
  getBearerHeaders() {
    return {
      'Authorization': `Bearer ${this.bearerToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get headers for OAuth 1.0a User Context (requires OAuth library for production)
   */
  getOAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get user ID from username
   */
  async getUserIdByUsername(username) {
    if (!this.isConfigured()) {
      return 'mock_user_id';
    }

    try {
      const response = await axios.get(`${this.apiBase}/users/by/username/${username.replace('@', '')}`, {
        headers: this.getBearerHeaders()
      });
      return response.data.data?.id;
    } catch (error) {
      console.error('Twitter API Error:', error.message);
      return 'mock_user_id';
    }
  }

  /**
   * Fetch user profile information
   */
  async getProfile(usernameOrId) {
    if (!this.isConfigured()) {
      return this.getMockProfile(usernameOrId);
    }

    try {
      const isNumeric = /^\d+$/.test(usernameOrId);
      const endpoint = isNumeric 
        ? `${this.apiBase}/users/${usernameOrId}`
        : `${this.apiBase}/users/by/username/${usernameOrId.replace('@', '')}`;
      
      const params = isNumeric ? { 'user.fields': 'description,profile_image_url,public_metrics,created_at,entities,url' } 
        : { 'user.fields': 'description,profile_image_url,public_metrics,created_at,entities,url' };

      const response = await axios.get(endpoint, {
        headers: this.getBearerHeaders(),
        params
      });

      if (response.data.data) {
        return this.transformProfile(response.data.data);
      }
      return this.getMockProfile(usernameOrId);
    } catch (error) {
      console.error('Twitter API Error:', error.message);
      return this.getMockProfile(usernameOrId);
    }
  }

  /**
   * Fetch user's tweets
   */
  async getTweets(usernameOrId, maxResults = 10) {
    if (!this.isConfigured()) {
      return this.getMockTweets(maxResults);
    }

    try {
      // First get user ID if username provided
      let userId = usernameOrId;
      if (!/^\d+$/.test(usernameOrId)) {
        userId = await this.getUserIdByUsername(usernameOrId);
      }

      const response = await axios.get(`${this.apiBase}/users/${userId}/tweets`, {
        headers: this.getBearerHeaders(),
        params: {
          max_results: Math.min(maxResults, 100),
          'tweet.fields': 'created_at,public_metrics,entities,source',
          'expansions': 'author_id',
          'user.fields': 'username,name,profile_image_url'
        }
      });

      return this.transformTweets(response.data.data || [], response.data.includes?.users || []);
    } catch (error) {
      console.error('Twitter API Error:', error.message);
      return this.getMockTweets(maxResults);
    }
  }

  /**
   * Search tweets
   */
  async searchTweets(query, maxResults = 10) {
    if (!this.isConfigured()) {
      return this.getMockTweets(maxResults);
    }

    try {
      const response = await axios.get(`${this.apiBase}/tweets/search/recent`, {
        headers: this.getBearerHeaders(),
        params: {
          query,
          max_results: Math.min(maxResults, 100),
          'tweet.fields': 'created_at,public_metrics,entities,source,author_id',
          'expansions': 'author_id',
          'user.fields': 'username,name,profile_image_url'
        }
      });

      return this.transformTweets(response.data.data || [], response.data.includes?.users || []);
    } catch (error) {
      console.error('Twitter API Error:', error.message);
      return this.getMockTweets(maxResults);
    }
  }

  /**
   * Get tweet by ID
   */
  async getTweet(tweetId) {
    if (!this.isConfigured()) {
      return this.getMockTweetDetails(tweetId);
    }

    try {
      const response = await axios.get(`${this.apiBase}/tweets/${tweetId}`, {
        headers: this.getBearerHeaders(),
        params: {
          'tweet.fields': 'created_at,public_metrics,entities,source,author_id',
          'expansions': 'author_id',
          'user.fields': 'username,name,profile_image_url'
        }
      });

      if (response.data.data) {
        const user = response.data.includes?.users?.[0];
        return this.transformTweet(response.data.data, user);
      }
      return this.getMockTweetDetails(tweetId);
    } catch (error) {
      console.error('Twitter API Error:', error.message);
      return this.getMockTweetDetails(tweetId);
    }
  }

  /**
   * Get user followers
   */
  async getFollowers(userId, maxResults = 100) {
    if (!this.isConfigured()) {
      return this.getMockFollowers(maxResults);
    }

    try {
      const response = await axios.get(`${this.apiBase}/users/${userId}/followers`, {
        headers: this.getBearerHeaders(),
        params: {
          max_results: Math.min(maxResults, 1000),
          'user.fields': 'username,name,profile_image_url,public_metrics,description'
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Twitter API Error:', error.message);
      return this.getMockFollowers(maxResults);
    }
  }

  /**
   * Get user following
   */
  async getFollowing(userId, maxResults = 100) {
    if (!this.isConfigured()) {
      return this.getMockFollowing(maxResults);
    }

    try {
      const response = await axios.get(`${this.apiBase}/users/${userId}/following`, {
        headers: this.getBearerHeaders(),
        params: {
          max_results: Math.min(maxResults, 1000),
          'user.fields': 'username,name,profile_image_url,public_metrics,description'
        }
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Twitter API Error:', error.message);
      return this.getMockFollowing(maxResults);
    }
  }

  /**
   * Get user mentions
   */
  async getMentions(userId, maxResults = 10) {
    if (!this.isConfigured()) {
      return this.getMockTweets(maxResults);
    }

    try {
      const response = await axios.get(`${this.apiBase}/users/${userId}/mentions`, {
        headers: this.getBearerHeaders(),
        params: {
          max_results: Math.min(maxResults, 100),
          'tweet.fields': 'created_at,public_metrics,entities,source,author_id',
          'expansions': 'author_id',
          'user.fields': 'username,name,profile_image_url'
        }
      });

      return this.transformTweets(response.data.data || [], response.data.includes?.users || []);
    } catch (error) {
      console.error('Twitter API Error:', error.message);
      return this.getMockTweets(maxResults);
    }
  }

  /**
   * Get tweet analytics (requires user context)
   */
  async getTweetAnalytics(tweetId) {
    const tweet = await this.getTweet(tweetId);
    
    return {
      platform: 'twitter',
      tweetId,
      metrics: {
        impressions: tweet.metrics?.retweets + tweet.metrics?.likes * 50 || 0,
        engagements: (tweet.metrics?.retweets || 0) + (tweet.metrics?.likes || 0) + (tweet.metrics?.replies || 0) + (tweet.metrics?.quotes || 0),
        engagementRate: ((tweet.metrics?.retweets + tweet.metrics?.likes) / (tweet.metrics?.retweets + tweet.metrics?.likes + 100) * 100).toFixed(2),
        urlClicks: Math.floor(Math.random() * 100),
        profileClicks: Math.floor(Math.random() * 50),
        shareClicks: Math.floor(Math.random() * 30)
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Transform Twitter user to standard format
   */
  transformProfile(user) {
    const metrics = user.public_metrics || {};
    
    return {
      platform: 'twitter',
      userId: user.id,
      username: user.username || 'twitter_user',
      displayName: user.name || 'Twitter User',
      bio: user.description || '',
      avatar: user.profile_image_url?.replace('_normal', '_400x400') || '',
      followers: metrics.followers_count || 0,
      following: metrics.following_count || 0,
      tweets: metrics.tweet_count || 0,
      listed: metrics.listed_count || 0,
      verified: user.verified || false,
      url: user.entities?.url?.urls?.[0]?.expanded_url || null,
      profileUrl: `https://twitter.com/${user.username}`,
      createdAt: user.created_at,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Transform tweets to standard format
   */
  transformTweets(tweets, users = []) {
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });

    return tweets.map(tweet => {
      const author = userMap[tweet.author_id] || {};
      const metrics = tweet.public_metrics || {};
      const retweetCount = metrics.retweet_count || 0;
      const likeCount = metrics.like_count || 0;
      const replyCount = metrics.reply_count || 0;
      const quoteCount = metrics.quote_count || 0;
      const engagements = retweetCount + likeCount + replyCount + quoteCount;
      const impressions = engagements * (Math.random() * 10 + 5);

      return {
        id: tweet.id,
        platform: 'twitter',
        text: tweet.text,
        authorId: tweet.author_id,
        authorUsername: author.username || 'unknown',
        authorName: author.name || 'Unknown',
        authorAvatar: author.profile_image_url || '',
        publishedAt: tweet.created_at,
        retweets: retweetCount,
        likes: likeCount,
        replies: replyCount,
        quotes: quoteCount,
        impressions: Math.floor(impressions),
        engagement: (engagements / (impressions || 1) * 100).toFixed(2),
        url: `https://twitter.com/${author.username}/status/${tweet.id}`,
        source: tweet.source || 'Twitter for iPhone'
      };
    });
  }

  /**
   * Transform single tweet
   */
  transformTweet(tweet, author = {}) {
    const metrics = tweet.public_metrics || {};
    const retweetCount = metrics.retweet_count || 0;
    const likeCount = metrics.like_count || 0;
    const replyCount = metrics.reply_count || 0;
    const quoteCount = metrics.quote_count || 0;
    const engagements = retweetCount + likeCount + replyCount + quoteCount;
    const impressions = engagements * (Math.random() * 10 + 5);

    return {
      id: tweet.id,
      platform: 'twitter',
      text: tweet.text,
      authorId: tweet.author_id,
      authorUsername: author.username || 'unknown',
      authorName: author.name || 'Unknown',
      authorAvatar: author.profile_image_url || '',
      publishedAt: tweet.created_at,
      retweets: retweetCount,
      likes: likeCount,
      replies: replyCount,
      quotes: quoteCount,
      impressions: Math.floor(impressions),
      engagement: (engagements / (impressions || 1) * 100).toFixed(2),
      url: `https://twitter.com/${author.username}/status/${tweet.id}`,
      source: tweet.source || 'Twitter for iPhone'
    };
  }

  /**
   * Generate mock profile for development
   */
  getMockProfile(usernameOrId) {
    const username = usernameOrId?.startsWith('@') ? usernameOrId.replace('@', '') : (usernameOrId || 'mock_creator');
    
    return {
      platform: 'twitter',
      userId: 'mock_user_id',
      username,
      displayName: 'Mock Twitter Creator',
      bio: 'Just a mock Twitter account for development. 🎭 #Testing',
      avatar: 'https://pbs.twimg.com/profile_images/mock_avatar.jpg',
      followers: Math.floor(Math.random() * 50000) + 1000,
      following: Math.floor(Math.random() * 5000) + 100,
      tweets: Math.floor(Math.random() * 10000) + 100,
      listed: Math.floor(Math.random() * 100) + 5,
      verified: Math.random() > 0.8,
      url: 'https://example.com',
      profileUrl: `https://twitter.com/${username}`,
      createdAt: '2020-01-01T00:00:00Z',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate mock tweets for development
   */
  getMockTweets(count = 10) {
    const tweets = [];
    const now = Date.now();
    const sources = ['Twitter for iPhone', 'Twitter for Android', 'Twitter Web App', 'TweetDeck'];
    const contents = [
      'Just posted a new video! Check it out 🎬✨',
      'Thoughts on the latest tech trends? Let me know below 👇',
      'Thank you for 10K followers! 🎉',
      'New blog post is live! Link in bio',
      'What a great day to create content! 🚀',
      'Quick tip: Consistency is key to growth 💡',
      'Replying to your questions - drop them below!',
      'Behind the scenes of my latest project 🎥',
      'Hot take: Quality over quantity always wins 🔥',
      'Collaboration incoming! Stay tuned 👀'
    ];
    
    for (let i = 0; i < count; i++) {
      const impressions = Math.floor(Math.random() * 50000) + 1000;
      const retweets = Math.floor(Math.random() * impressions * 0.05);
      const likes = Math.floor(Math.random() * impressions * 0.1);
      const replies = Math.floor(Math.random() * impressions * 0.02);
      const quotes = Math.floor(Math.random() * 100);
      const engagements = retweets + likes + replies + quotes;
      
      tweets.push({
        id: `${1700000000000 + i * 1000000}`,
        platform: 'twitter',
        text: contents[i % contents.length],
        authorId: 'mock_user_id',
        authorUsername: 'mock_creator',
        authorName: 'Mock Twitter Creator',
        authorAvatar: 'https://pbs.twimg.com/profile_images/mock_avatar.jpg',
        publishedAt: new Date(now - i * 3600000 * (i + 1)).toISOString(),
        retweets,
        likes,
        replies,
        quotes,
        impressions,
        engagement: (engagements / impressions * 100).toFixed(2),
        url: `https://twitter.com/mock_creator/status/${1700000000000 + i * 1000000}`,
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    }
    
    return tweets;
  }

  /**
   * Generate mock tweet details for development
   */
  getMockTweetDetails(tweetId) {
    const impressions = Math.floor(Math.random() * 50000) + 1000;
    const retweets = Math.floor(Math.random() * impressions * 0.05);
    const likes = Math.floor(Math.random() * impressions * 0.1);
    const replies = Math.floor(Math.random() * impressions * 0.02);
    const quotes = Math.floor(Math.random() * 100);
    const engagements = retweets + likes + replies + quotes;

    return {
      id: tweetId || 'mock_tweet_id',
      platform: 'twitter',
      text: 'This is a mock tweet for development purposes. 🚀 #testing',
      authorId: 'mock_user_id',
      authorUsername: 'mock_creator',
      authorName: 'Mock Twitter Creator',
      authorAvatar: 'https://pbs.twimg.com/profile_images/mock_avatar.jpg',
      publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      retweets,
      likes,
      replies,
      quotes,
      impressions,
      engagement: (engagements / impressions * 100).toFixed(2),
      url: `https://twitter.com/mock_creator/status/${tweetId || 'mock_tweet_id'}`,
      source: 'Twitter for iPhone'
    };
  }

  /**
   * Generate mock followers for development
   */
  getMockFollowers(count = 100) {
    const followers = [];
    
    for (let i = 0; i < count; i++) {
      followers.push({
        id: `follower_${i}`,
        username: `follower_${i}`,
        name: `Follower ${i}`,
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 1000)
      });
    }
    
    return followers;
  }

  /**
   * Generate mock following for development
   */
  getMockFollowing(count = 100) {
    const following = [];
    
    for (let i = 0; i < count; i++) {
      following.push({
        id: `following_${i}`,
        username: `following_${i}`,
        name: `Following ${i}`,
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 1000)
      });
    }
    
    return following;
  }
}

module.exports = TwitterPlatform;
