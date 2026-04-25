# CreatorHub

<p align="center">
  <img src="https://img.shields.io/badge/TikTok-YouTube-FF6B6B?style=for-the-badge&logo=tiktok&logoColor=white" alt="Social">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome">
</p>

> 📊 **Cross-Platform Creator Analytics** — Unified dashboard for TikTok, YouTube, Instagram, and Twitter/X. Track trends, analyze audiences, and accelerate your growth with AI-powered insights.

## About

CreatorHub is an all-in-one analytics platform designed for content creators, social media managers, and marketing agencies. It aggregates metrics from multiple social platforms into a single dashboard, providing actionable insights through AI-powered trend prediction, content suggestions, and performance optimization.

**Who it's for:**
- Content creators managing presence across multiple platforms
- Social media managers handling multiple client accounts
- Marketing agencies needing unified analytics reporting
- Brands tracking influencer and owned social performance

## Features

### Analytics Dashboard

| Feature | Description |
|---------|-------------|
| 📈 **Unified Metrics** | Views, likes, comments, shares, followers across all platforms |
| 👥 **Audience Insights** | Demographics, geographic distribution, peak activity times |
| 📊 **Trend Detection** | Real-time identification of rising topics and hashtags |
| 📉 **Comparative Analysis** | Side-by-side performance comparison across platforms |
| 📅 **Content Calendar** | Plan and visualize content scheduling |

### Platform Integrations

| Platform | Content Types Supported |
|----------|------------------------|
| 🎵 **TikTok** | Videos, LIVE streams, analytics, duet, stitch |
| 📺 **YouTube** | Videos, Shorts, LIVE, Community posts |
| 📸 **Instagram** | Posts, Reels, Stories, IGTV, Lives |
| 🐦 **Twitter/X** | Tweets, Threads, Spaces, Media |

### AI-Powered Features

| Feature | Description |
|---------|-------------|
| 🤖 **Trend Prediction** | AI forecasts content viral potential before posting |
| 💡 **Content Ideas** | Personalized content suggestions based on past performance |
| 📝 **Caption Generator** | AI writes engaging, platform-optimized captions |
| 🏷️ **Hashtag Optimizer** | Recommends optimal hashtags for maximum reach |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CreatorHub System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Frontend (React)                       │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Dashboard UI                                        │  │   │
│  │  │  • Metrics visualization (Recharts)                  │  │   │
│  │  │  • Content calendar                                  │  │   │
│  │  │  • Audience analytics                                │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌────────────────────────────┴──────────────────────────────┐   │
│  │                   API Gateway (Node.js)                   │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │   │
│  │  │    Auth      │ │    Rate      │ │   Platform   │     │   │
│  │  │  Middleware  │ │   Limiter    │ │    Router    │     │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌────────────────────────────┴──────────────────────────────┐   │
│  │                   Platform Connectors                      │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │   │
│  │  │  TikTok   │ │  YouTube  │ │ Instagram │ │  Twitter  │  │   │
│  │  │  Connector│ │  Connector│ │  Connector│ │  Connector│  │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌────────────────────────────┴──────────────────────────────┐   │
│  │                   AI Services Layer                        │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │   │
│  │  │    Trend     │ │   Content    │ │   Caption    │        │   │
│  │  │  Predictor   │ │  Generator   │ │  Generator   │        │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌────────────────────────────┴──────────────────────────────┐   │
│  │                      Storage                               │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │   │
│  │  │ PostgreSQL│ │   Redis   │ │    S3     │ │   Queue   │  │   │
│  │  │(Analytics)│ │ (Cache)   │ │  (Media)  │ │(Jobs)     │  │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript 5.5, Tailwind CSS, Recharts |
| **Backend** | Node.js 20+, Express.js |
| **Database** | PostgreSQL 15, Redis 7 |
| **AI/ML** | OpenAI API, TensorFlow.js |
| **API Integrations** | TikTok API, YouTube Data API, Instagram Graph API, Twitter API v2 |
| **Storage** | AWS S3 / S3-compatible |
| **Job Queue** | BullMQ |

## Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or pnpm

### Steps

```bash
# Clone the repository
git clone https://github.com/moggan1337/CreatorHub.git
cd CreatorHub

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Configure environment variables
# Add API keys for each platform:
# - TikTok API credentials
# - YouTube Data API key
# - Instagram Graph API tokens
# - Twitter API v2 Bearer token

# Initialize database
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `TIKTOK_CLIENT_KEY` | TikTok API client key | Platform-specific |
| `TIKTOK_CLIENT_SECRET` | TikTok API client secret | Platform-specific |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | Platform-specific |
| `INSTAGRAM_APP_ID` | Instagram Graph API App ID | Platform-specific |
| `INSTAGRAM_APP_SECRET` | Instagram Graph API Secret | Platform-specific |
| `TWITTER_BEARER_TOKEN` | Twitter API v2 Bearer Token | Platform-specific |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Optional |

## Quick Start

### 1. Connect Your Platforms

After starting the server, navigate to `http://localhost:3000` and connect your social media accounts via OAuth.

### 2. View Unified Dashboard

See aggregated metrics from all connected platforms in a single view.

### 3. Generate AI Content

```javascript
// Get AI content suggestions
const response = await fetch('http://localhost:3000/api/ai/suggest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'tiktok',
    niche: 'technology',
    count: 5
  })
});

const suggestions = await response.json();
console.log(suggestions);
// {
//   "suggestions": [
//     "5 coding tips that will change your workflow",
//     "Building a PC: Ultimate beginner's guide",
//     ...
//   ]
// }
```

### 4. Schedule Content

```javascript
// Schedule a post
await fetch('http://localhost:3000/api/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platform: 'instagram',
    content: 'Check out our new product launch!',
    scheduledTime: '2024-11-20T18:00:00Z'
  })
});
```

## API Reference

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/overview` | Get unified analytics overview |
| `GET` | `/api/analytics/:platform` | Get platform-specific analytics |
| `GET` | `/api/analytics/:platform/audience` | Get audience insights |

### Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/content` | List all content |
| `POST` | `/api/content` | Create new content |
| `PUT` | `/api/content/:id` | Update content |
| `DELETE` | `/api/content/:id` | Delete content |
| `POST` | `/api/content/:id/publish` | Publish content |

### Scheduling

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/schedule` | List scheduled posts |
| `POST` | `/api/schedule` | Schedule a new post |
| `DELETE` | `/api/schedule/:id` | Cancel scheduled post |
| `PUT` | `/api/schedule/:id` | Update scheduled post |

### AI Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/suggest` | Get content suggestions |
| `POST` | `/api/ai/caption` | Generate caption |
| `POST` | `/api/ai/hashtags` | Get hashtag recommendations |
| `POST` | `/api/ai/trend` | Predict trend potential |

## Contributing

Contributions are welcome! Please follow these steps:

```bash
# Fork the repository
git clone https://github.com/<your-username>/CreatorHub.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m "Add: amazing feature"

# Push and open a PR
git push origin feature/amazing-feature
```

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write unit tests for new features
- Update API documentation for endpoint changes

## License

MIT License — See [LICENSE](LICENSE)

Copyright © 2024 CreatorHub Contributors

---

<p align="center">
  <sub>Empowering creators with data-driven insights</sub>
</p>
