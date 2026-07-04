# CreatorHub 🎬

Cross-platform analytics aggregator for social media creators. Monitor your TikTok, YouTube, Instagram, and Twitter/X performance from a single unified API.

## Features

- **Multi-Platform Support**: TikTok, YouTube, Instagram, Twitter/X
- **Unified Analytics**: Aggregate metrics across all platforms
- **Content Aggregation**: View all your content in one place
- **Performance Comparison**: Compare engagement and growth across platforms
- **Trending Content**: See your top-performing content across platforms
- **Comprehensive Reports**: Generate detailed performance reports with insights

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### API Keys Setup

#### TikTok API
1. Create a TikTok Developer account at [developers.tiktok.com](https://developers.tiktok.com)
2. Create an app and get your Client Key and Client Secret
3. Obtain an Access Token through OAuth flow

#### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable YouTube Data API v3
3. Create credentials (API Key)

#### Instagram Basic Display API
1. Create a Facebook Developer account
2. Create an Instagram app
3. Get a Long-Lived Access Token

#### Twitter/X API v2
1. Apply for a Twitter Developer account
2. Create a project and app in the Developer Portal
3. Get your API Key, API Secret, and Bearer Token

#### Xquik X Search
1. Create an Xquik API key from your Xquik dashboard
2. Set `XQUIK_API_KEY` to use Xquik for Twitter/X search and timeline reads
3. Optionally set `XQUIK_BASE_URL` when testing against another Xquik host

## Usage

### Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

The server will start at `http://localhost:3000`

### Run Tests

```bash
npm test
```

## API Endpoints

### Health Check
```
GET /health
```

### Profiles
```
GET /api/profiles                    # All platform profiles
GET /api/profiles?tiktok=user        # Specific platform
```

### Content
```
GET /api/content                     # All platform content
GET /api/content?tiktokLimit=10      # With limits
```

### Analytics
```
GET /api/analytics                   # Default 7-day analytics
GET /api/analytics?period=30d       # Custom period (24h, 7d, 30d, 90d)
GET /api/analytics/7d               # Direct period endpoint
```

### Comparison
```
GET /api/compare                     # Compare all platforms
```

### Trending
```
GET /api/trending                    # Top performing content
GET /api/trending?limit=10          # Custom limit
```

### Reports
```
GET /api/report                      # Comprehensive report
GET /api/report?period=30d          # Report with custom period
```

### Platform-Specific

#### TikTok
```
GET /api/platforms/tiktok
GET /api/platforms/tiktok/profile
GET /api/platforms/tiktok/content
GET /api/platforms/tiktok/analytics
```

#### YouTube
```
GET /api/platforms/youtube
GET /api/platforms/youtube/profile?channelId=UC...
GET /api/platforms/youtube/content
GET /api/platforms/youtube/analytics
```

#### Instagram
```
GET /api/platforms/instagram
GET /api/platforms/instagram/profile
GET /api/platforms/instagram/content
GET /api/platforms/instagram/analytics
```

#### Twitter/X
```
GET /api/platforms/twitter
GET /api/platforms/twitter/profile?username=handle
GET /api/platforms/twitter/content
GET /api/platforms/twitter/analytics
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Error description"
}
```

## Platform Integrations

### TikTok
- Profile information
- Video list with engagement metrics
- Analytics (views, followers, likes)
- Video-specific analytics

### YouTube
- Channel statistics
- Video list with view counts
- Search functionality
- Engagement metrics

### Instagram
- Profile and account info
- Media posts (images, videos, carousels)
- Stories
- Insights (followers, reach, engagement)

### Twitter/X
- User profiles
- Tweets with metrics
- Followers/following
- Mentions
- Optional Xquik-backed tweet search and recent content reads

## Mock Data

Without API credentials, the platform integrations use realistic mock data for development and testing purposes.

## Development

### Project Structure
```
CreatorHub/
├── src/
│   ├── platforms/     # Platform integrations
│   │   ├── tiktok.js
│   │   ├── youtube.js
│   │   ├── instagram.js
│   │   └── twitter.js
│   ├── routes/        # API routes
│   │   └── analytics.js
│   ├── analytics.js   # Analytics aggregator
│   └── app.js         # Express application
├── tests/             # Jest tests
├── package.json
└── README.md
```

### Adding New Platforms

1. Create a new file in `src/platforms/`
2. Implement the platform class with:
   - `getProfile()` - Fetch profile data
   - `getVideos()` / `getMedia()` / `getTweets()` - Fetch content
   - `getAnalytics()` - Fetch analytics
   - Transform methods to standardize data format
3. Register the platform in `src/analytics.js`
4. Add tests

## License

MIT
