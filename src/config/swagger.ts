import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';
import './swagger-schemas';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Open Podcast Analytics API',
      version: version,
      description: `
# Open Podcast Analytics API

Comprehensive podcast analytics API providing metrics from multiple platforms including Spotify, Apple Podcasts, and custom hosting providers.

## Available Data

### Spotify Data
- Episode and podcast streams (starts and completed streams, daily granularity)
- Listener counts (unique listeners over time)
- Followers of the podcast (daily snapshots)
- Episode performance (median listen percentage, median seconds, percentiles, listen-through curves on a per-second basis)
- Audience demographics (age groups, gender, country, at both episode and podcast level)
- Podcast metadata (episode titles, descriptions, artwork, URLs, release dates, explicit flag, duration, language)
- Historical metadata snapshots (track changes over time)
- Impressions and funnel data (total impressions, impressions by source such as home, search, library, other, funnel stages from impressions to considerations to streams, conversion percentages per day)

### Apple Podcasts Data
- Episode metadata (episode name, collection/podcast name, release datetime, GUID, episode number, type)
- Episode details (plays, total time listened, unique engaged listeners, unique listeners, engaged plays vs. total plays)
- Playback histograms (listen-through on a time-bucket basis, top countries and cities, median listeners at different quarters of the episode)
- Trends (daily episode-level metrics: plays, total time listened, unique listeners, engaged listeners)
- Trends (daily podcast-level metrics: same as above, aggregated across episodes)
- Listening time split by followers vs. non-followers
- Follower statistics (total followers, unfollowers, gained/lost per day)

### General Metrics
- Plays, streams, downloads (episode and podcast level, daily)
- Listen-through data (per-second or per-bucket playback curves, histograms, medians, percentiles)
- Audience demographics (age, gender, country)
- Followers and subscribers (absolute numbers and gained/lost trends)
- Impressions and funnel steps (Spotify)
- Metadata (titles, descriptions, release dates, artwork, language)
- Historical snapshots (to track changes over time)

## Authentication

All endpoints require a Bearer token in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_TOKEN
\`\`\`

## Date Parameters

Most endpoints accept date range parameters:
- \`start\`: Start date in YYYY-MM-DD format
- \`end\`: End date in YYYY-MM-DD format
      `,
      contact: {
        name: 'Open Podcast',
        url: 'https://openpodcast.dev',
        email: 'echo@openpodcast.dev',
      },
      license: {
        name: 'MIT',
        url: 'https://github.com/openpodcast/api/blob/main/LICENSE',
      },
    },
    servers: [
      {
        url: 'https://api.openpodcast.dev',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your API token',
        },
      },
      parameters: {
        podcastId: {
          name: 'podcast_id',
          in: 'path',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'Podcast ID',
        },
        startDate: {
          name: 'start',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            example: '2024-01-01',
          },
          description: 'Start date (YYYY-MM-DD)',
        },
        endDate: {
          name: 'end',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            example: '2024-12-31',
          },
          description: 'End date (YYYY-MM-DD)',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Spotify',
        description: 'Spotify podcast analytics endpoints',
      },
      {
        name: 'Apple Podcasts',
        description: 'Apple Podcasts analytics endpoints',
      },
      {
        name: 'Episodes',
        description: 'Episode-level metrics across platforms',
      },
      {
        name: 'Podcast',
        description: 'Podcast-level metrics and metadata',
      },
      {
        name: 'Hoster',
        description: 'Generic hosting provider metrics',
      },
      {
        name: 'Charts',
        description: 'Chart rankings and positions',
      },
    ],
  },
  apis: ['./src/api/*.ts', './src/index.ts', './src/config/swagger-schemas.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
