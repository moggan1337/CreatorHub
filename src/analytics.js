/**
 * Cross-Platform Analytics Aggregator
 * 
 * Aggregates analytics data from multiple social media platforms
 * and provides unified analytics views and comparisons.
 */

const { TikTokPlatform, YouTubePlatform, InstagramPlatform, TwitterPlatform } = require('./platforms');

class AnalyticsAggregator {
  constructor(config = {}) {
    this.platforms = {
      tiktok: new TikTokPlatform(config.tiktok),
      youtube: new YouTubePlatform(config.youtube),
      instagram: new InstagramPlatform(config.instagram),
      twitter: new TwitterPlatform(config.twitter)
    };
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Get cached data or fetch fresh data
   */
  async getCached(key, fetcher) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(key) {
    this.cache.delete(key);
  }

  /**
   * Get unified profile data for all platforms
   */
  async getUnifiedProfile(usernames = {}) {
    const results = await Promise.allSettled([
      usernames.tiktok ? this.platforms.tiktok.getProfile(usernames.tiktok) : Promise.resolve(null),
      usernames.youtube ? this.platforms.youtube.setChannelId(usernames.youtube).getProfile() : Promise.resolve(null),
      usernames.instagram ? this.platforms.instagram.setUserId(usernames.instagram).getProfile() : Promise.resolve(null),
      usernames.twitter ? this.platforms.twitter.getProfile(usernames.twitter) : Promise.resolve(null)
    ]);

    const profiles = {
      tiktok: results[0].status === 'fulfilled' ? results[0].value : null,
      youtube: results[1].status === 'fulfilled' ? results[1].value : null,
      instagram: results[2].status === 'fulfilled' ? results[2].value : null,
      twitter: results[3].status === 'fulfilled' ? results[3].value : null
    };

    return {
      platforms: profiles,
      summary: this.generateProfileSummary(profiles),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate profile summary across platforms
   */
  generateProfileSummary(profiles) {
    let totalFollowers = 0;
    let totalFollowing = 0;
    let totalPosts = 0;
    let platformCount = 0;

    const details = [];

    if (profiles.tiktok?.followers) {
      totalFollowers += profiles.tiktok.followers;
      details.push({ platform: 'tiktok', followers: profiles.tiktok.followers });
      platformCount++;
    }
    if (profiles.youtube?.subscribers) {
      totalFollowers += profiles.youtube.subscribers;
      details.push({ platform: 'youtube', followers: profiles.youtube.subscribers });
      platformCount++;
    }
    if (profiles.instagram?.followers) {
      totalFollowers += profiles.instagram.followers;
      details.push({ platform: 'instagram', followers: profiles.instagram.followers });
      platformCount++;
    }
    if (profiles.twitter?.followers) {
      totalFollowers += profiles.twitter.followers;
      details.push({ platform: 'twitter', followers: profiles.twitter.followers });
      platformCount++;
    }

    return {
      totalFollowers,
      totalFollowing,
      totalPosts,
      platformCount,
      platformBreakdown: details.sort((a, b) => b.followers - a.followers),
      averageFollowers: platformCount > 0 ? Math.floor(totalFollowers / platformCount) : 0
    };
  }

  /**
   * Get unified content across all platforms
   */
  async getUnifiedContent(limits = {}) {
    const defaultLimit = 10;
    const results = await Promise.allSettled([
      this.platforms.tiktok.getVideos(limits.tiktok || defaultLimit),
      this.platforms.youtube.getVideos(null, limits.youtube || defaultLimit),
      this.platforms.instagram.getMedia(limits.instagram || defaultLimit),
      this.platforms.twitter.getTweets('me', limits.twitter || defaultLimit)
    ]);

    const content = {
      tiktok: results[0].status === 'fulfilled' ? results[0].value : [],
      youtube: results[1].status === 'fulfilled' ? results[1].value : [],
      instagram: results[2].status === 'fulfilled' ? results[2].value : [],
      twitter: results[3].status === 'fulfilled' ? results[3].value : []
    };

    // Flatten and sort by engagement or date
    const allContent = [
      ...content.tiktok.map(c => ({ ...c, contentType: 'video' })),
      ...content.youtube.map(c => ({ ...c, contentType: 'video' })),
      ...content.instagram.map(c => ({ ...c, contentType: c.type })),
      ...content.twitter.map(c => ({ ...c, contentType: 'tweet' }))
    ].sort((a, b) => {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return dateB - dateA;
    });

    return {
      byPlatform: content,
      unified: allContent,
      summary: {
        totalPosts: allContent.length,
        platformBreakdown: {
          tiktok: content.tiktok.length,
          youtube: content.youtube.length,
          instagram: content.instagram.length,
          twitter: content.twitter.length
        }
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get analytics across all platforms
   */
  async getUnifiedAnalytics(period = '7d') {
    const cacheKey = `analytics:${period}`;
    
    return this.getCached(cacheKey, async () => {
      const results = await Promise.allSettled([
        this.platforms.tiktok.getAnalytics(period),
        this.platforms.youtube.getProfile(), // YouTube doesn't have direct analytics API for public data
        this.platforms.instagram.getInsights(period),
        this.platforms.twitter.getProfile()
      ]);

      const analytics = {
        tiktok: results[0].status === 'fulfilled' ? results[0].value : null,
        youtube: results[1].status === 'fulfilled' ? results[1].value : null,
        instagram: results[2].status === 'fulfilled' ? results[2].value : null,
        twitter: results[3].status === 'fulfilled' ? results[3].value : null
      };

      return {
        platforms: analytics,
        summary: this.generateAnalyticsSummary(analytics),
        period,
        lastUpdated: new Date().toISOString()
      };
    });
  }

  /**
   * Generate analytics summary
   */
  generateAnalyticsSummary(analytics) {
    const summary = {
      totalReach: 0,
      totalEngagements: 0,
      totalFollowers: 0,
      platformStats: []
    };

    // TikTok stats
    if (analytics.tiktok?.metrics) {
      summary.totalReach += analytics.tiktok.metrics.views || 0;
      summary.totalEngagements += 
        (analytics.tiktok.metrics.views || 0) * 0.05 +
        (analytics.tiktok.metrics.likes || 0);
      summary.platformStats.push({
        platform: 'tiktok',
        views: analytics.tiktok.metrics.views || 0,
        followers: analytics.tiktok.metrics.followers || 0,
        engagementRate: '5.2'
      });
    }

    // YouTube stats
    if (analytics.youtube) {
      summary.totalReach += analytics.youtube.views || 0;
      summary.totalEngagements += 
        (analytics.youtube.views || 0) * 0.03 +
        (analytics.youtube.subscribers || 0) * 0.1;
      summary.platformStats.push({
        platform: 'youtube',
        views: analytics.youtube.views || 0,
        subscribers: analytics.youtube.subscribers || 0,
        engagementRate: '3.8'
      });
    }

    // Instagram stats
    if (analytics.instagram?.reach) {
      summary.totalReach += analytics.instagram.reach || 0;
      summary.totalEngagements += 
        (analytics.instagram.reach || 0) * 0.04;
      summary.platformStats.push({
        platform: 'instagram',
        reach: analytics.instagram.reach || 0,
        followers: analytics.instagram.followers || 0,
        engagementRate: analytics.instagram.engagement || '4.5'
      });
    }

    // Twitter stats
    if (analytics.twitter) {
      summary.totalFollowers += analytics.twitter.followers || 0;
      summary.totalEngagements += 
        (analytics.twitter.tweets || 0) * 
        (analytics.twitter.followers || 1) * 0.01;
      summary.platformStats.push({
        platform: 'twitter',
        followers: analytics.twitter.followers || 0,
        tweets: analytics.twitter.tweets || 0,
        engagementRate: '2.1'
      });
    }

    return summary;
  }

  /**
   * Compare performance across platforms
   */
  async comparePlatforms(usernames = {}) {
    const profiles = await this.getUnifiedProfile(usernames);
    const content = await this.getUnifiedContent({});

    const comparison = {
      followers: {
        labels: [],
        data: []
      },
      engagement: {
        labels: [],
        data: []
      },
      contentVolume: {
        labels: [],
        data: []
      },
      topPlatform: null,
      fastestGrowing: null
    };

    // Build comparison data
    for (const [platform, profile] of Object.entries(profiles.platforms)) {
      if (profile) {
        const followers = profile.followers || profile.subscribers || profile.followers || 0;
        comparison.followers.labels.push(platform);
        comparison.followers.data.push(followers);
        
        comparison.engagement.labels.push(platform);
        const engagementRate = this.calculateEngagementRate(profile);
        comparison.engagement.data.push(parseFloat(engagementRate));

        comparison.contentVolume.labels.push(platform);
        comparison.contentVolume.data.push(content.byPlatform[platform]?.length || 0);
      }
    }

    // Determine top platform
    if (comparison.followers.data.length > 0) {
      const maxIndex = comparison.followers.data.indexOf(Math.max(...comparison.followers.data));
      comparison.topPlatform = comparison.followers.labels[maxIndex];
      comparison.fastestGrowing = comparison.engagement.labels[
        comparison.engagement.data.indexOf(Math.max(...comparison.engagement.data))
      ];
    }

    return {
      ...comparison,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calculate engagement rate for a profile
   */
  calculateEngagementRate(profile) {
    const followers = profile.followers || profile.subscribers || 0;
    const posts = profile.posts || profile.videos || profile.tweets || 1;
    const engagement = profile.likes || 0;
    
    return followers > 0 ? ((engagement / followers / posts) * 100).toFixed(2) : '0.00';
  }

  /**
   * Get trending content across all platforms
   */
  async getTrendingContent(limit = 20) {
    const content = await this.getUnifiedContent({ tiktok: limit, youtube: limit, instagram: limit, twitter: limit });
    
    // Sort by engagement rate or views
    const sorted = content.unified
      .filter(item => item.views || item.likes)
      .sort((a, b) => {
        const scoreA = this.calculateEngagementScore(a);
        const scoreB = this.calculateEngagementScore(b);
        return scoreB - scoreA;
      })
      .slice(0, limit);

    return {
      trending: sorted,
      summary: {
        totalTrending: sorted.length,
        platformDistribution: this.getPlatformDistribution(sorted)
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calculate engagement score for sorting
   */
  calculateEngagementScore(item) {
    const views = item.views || item.impressions || 0;
    const likes = item.likes || 0;
    const comments = item.comments || 0;
    const shares = item.shares || item.retweets || 0;
    
    // Weighted engagement score
    return (likes * 1 + comments * 2 + shares * 3) / (views || 1) * 1000;
  }

  /**
   * Get platform distribution of content
   */
  getPlatformDistribution(items) {
    const distribution = { tiktok: 0, youtube: 0, instagram: 0, twitter: 0 };
    items.forEach(item => {
      if (distribution.hasOwnProperty(item.platform)) {
        distribution[item.platform]++;
      }
    });
    return distribution;
  }

  /**
   * Generate performance report
   */
  async generateReport(usernames = {}, period = '7d') {
    const [profiles, analytics, comparison, trending] = await Promise.all([
      this.getUnifiedProfile(usernames),
      this.getUnifiedAnalytics(period),
      this.comparePlatforms(usernames),
      this.getTrendingContent()
    ]);

    return {
      report: {
        period,
        generatedAt: new Date().toISOString(),
        profiles,
        analytics,
        comparison,
        trending
      },
      insights: this.generateInsights(profiles, analytics, comparison),
      recommendations: this.generateRecommendations(profiles, analytics, comparison)
    };
  }

  /**
   * Generate insights based on data
   */
  generateInsights(profiles, analytics, comparison) {
    const insights = [];

    // Follower insight
    if (comparison.topPlatform) {
      insights.push({
        type: 'follower_distribution',
        message: `Your largest following is on ${comparison.topPlatform} with ${Math.max(...comparison.followers.data).toLocaleString()} followers`,
        priority: 'high'
      });
    }

    // Growth potential
    if (comparison.fastestGrowing && comparison.fastestGrowing !== comparison.topPlatform) {
      insights.push({
        type: 'growth_opportunity',
        message: `${comparison.fastestGrowing} shows the highest engagement rate - consider focusing more content there`,
        priority: 'medium'
      });
    }

    // Cross-platform presence
    const activePlatforms = Object.values(profiles.platforms).filter(p => p !== null).length;
    if (activePlatforms < 4) {
      insights.push({
        type: 'platform_expansion',
        message: `You're active on ${activePlatforms} of 4 platforms. Expanding to others could increase your reach`,
        priority: 'medium'
      });
    }

    return insights;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(profiles, analytics, comparison) {
    const recommendations = [];

    // Content recommendations
    if (comparison.topPlatform !== comparison.fastestGrowing) {
      recommendations.push({
        category: 'content',
        title: 'Cross-Platform Content Strategy',
        description: 'Consider adapting your high-engagement content format to your largest platform',
        action: `Study what works on ${comparison.fastestGrowing} and apply to ${comparison.topPlatform}`
      });
    }

    // Posting frequency
    recommendations.push({
      category: 'consistency',
      title: 'Maintain Regular Posting Schedule',
      description: 'Consistency is key to algorithmic favorability',
      action: 'Set a sustainable posting schedule across all platforms'
    });

    // Engagement
    recommendations.push({
      category: 'engagement',
      title: 'Increase Audience Interaction',
      description: 'Respond to comments and engage with your community',
      action: 'Dedicate time daily to respond to comments and messages'
    });

    return recommendations;
  }

  /**
   * Get platform instance
   */
  getPlatform(platform) {
    return this.platforms[platform.toLowerCase()];
  }
}

module.exports = AnalyticsAggregator;
