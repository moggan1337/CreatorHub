/**
 * Express App Tests
 */

const request = require('supertest');
const app = require('../src/app');

describe('CreatorHub Express App', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'CreatorHub');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api', () => {
    it('should return API info', async () => {
      const response = await request(app).get('/api');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'CreatorHub API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /api/profiles', () => {
    it('should return unified profiles', async () => {
      const response = await request(app).get('/api/profiles');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('platforms');
      expect(response.body.data).toHaveProperty('summary');
    });

    it('should accept username parameters', async () => {
      const response = await request(app)
        .get('/api/profiles')
        .query({ tiktok: 'test', twitter: '@test' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/content', () => {
    it('should return unified content', async () => {
      const response = await request(app).get('/api/content');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('byPlatform');
      expect(response.body.data).toHaveProperty('unified');
    });

    it('should accept limit parameters', async () => {
      const response = await request(app)
        .get('/api/content')
        .query({ tiktokLimit: 5, youtubeLimit: 3 });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/analytics', () => {
    it('should return analytics with default period', async () => {
      const response = await request(app).get('/api/analytics');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('platforms');
      expect(response.body.data).toHaveProperty('summary');
    });

    it('should accept period parameter', async () => {
      const response = await request(app)
        .get('/api/analytics')
        .query({ period: '30d' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.period).toBe('30d');
    });
  });

  describe('GET /api/analytics/:period', () => {
    it('should return analytics for valid period', async () => {
      const response = await request(app).get('/api/analytics/7d');
      
      expect(response.status).toBe(200);
      expect(response.body.data.period).toBe('7d');
    });

    it('should reject invalid period', async () => {
      const response = await request(app).get('/api/analytics/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid period');
    });
  });

  describe('GET /api/compare', () => {
    it('should return platform comparison', async () => {
      const response = await request(app).get('/api/compare');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('followers');
      expect(response.body.data).toHaveProperty('engagement');
      expect(response.body.data).toHaveProperty('topPlatform');
    });
  });

  describe('GET /api/trending', () => {
    it('should return trending content', async () => {
      const response = await request(app).get('/api/trending');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('trending');
      expect(response.body.data).toHaveProperty('summary');
    });

    it('should accept limit parameter', async () => {
      const response = await request(app)
        .get('/api/trending')
        .query({ limit: 5 });
      
      expect(response.status).toBe(200);
      // Trending uses a minimum of 1 for limit
      expect(response.body.data.trending.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/report', () => {
    it('should generate comprehensive report', async () => {
      const response = await request(app).get('/api/report');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('report');
      expect(response.body.data).toHaveProperty('insights');
      expect(response.body.data).toHaveProperty('recommendations');
    });

    it('should accept period parameter', async () => {
      const response = await request(app)
        .get('/api/report')
        .query({ period: '30d' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.report.period).toBe('30d');
    });
  });

  describe('GET /api/platforms', () => {
    it('should list available platforms', async () => {
      const response = await request(app).get('/api/platforms');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.platforms).toHaveLength(4);
      
      const platforms = response.body.data.platforms.map(p => p.id);
      expect(platforms).toContain('tiktok');
      expect(platforms).toContain('youtube');
      expect(platforms).toContain('instagram');
      expect(platforms).toContain('twitter');
    });
  });

  describe('GET /api/platforms/:platform', () => {
    it('should return platform data for valid platform', async () => {
      const response = await request(app).get('/api/platforms/tiktok');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('platform', 'tiktok');
      expect(response.body.data).toHaveProperty('profile');
      expect(response.body.data).toHaveProperty('recentContent');
    });

    it('should return 400 for invalid platform', async () => {
      const response = await request(app).get('/api/platforms/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid platform');
    });
  });

  describe('GET /api/platforms/:platform/profile', () => {
    it('should return platform profile', async () => {
      const response = await request(app).get('/api/platforms/youtube/profile');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('platform', 'youtube');
    });

    it('should accept username parameter', async () => {
      const response = await request(app)
        .get('/api/platforms/twitter/profile')
        .query({ username: 'testuser' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/platforms/:platform/content', () => {
    it('should return platform content', async () => {
      const response = await request(app).get('/api/platforms/instagram/content');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('platform', 'instagram');
      expect(response.body.data).toHaveProperty('content');
    });

    it('should accept limit parameter', async () => {
      const response = await request(app)
        .get('/api/platforms/tiktok/content')
        .query({ limit: 5 });
      
      expect(response.status).toBe(200);
      expect(response.body.data.content.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/platforms/:platform/analytics', () => {
    it('should return platform analytics', async () => {
      const response = await request(app).get('/api/platforms/tiktok/analytics');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('platform', 'tiktok');
      expect(response.body.data).toHaveProperty('analytics');
    });

    it('should accept period parameter', async () => {
      const response = await request(app)
        .get('/api/platforms/instagram/analytics')
        .query({ period: '28d' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown/route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app).get('/health');
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    it('should handle OPTIONS requests', async () => {
      const response = await request(app).options('/health');
      
      expect(response.status).toBe(200);
    });
  });
});
