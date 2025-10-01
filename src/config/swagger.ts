import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';
import './swagger-schemas';
import { generateQueryPaths } from './generate-query-docs';

const { paths: queryPaths, categories } = generateQueryPaths();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Open Podcast Analytics API',
      version: version,
      description: 'Podcast analytics API providing metrics from Spotify, Apple Podcasts, and custom hosting providers. Query endpoints are defined as SQL files in db_schema/queries/v1/.',
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
        name: 'Analytics',
        description: 'Query podcast analytics data from multiple sources',
      },
      ...categories.map(cat => ({
        name: cat,
        description: `${cat} analytics endpoints`,
      })),
    ],
    paths: queryPaths,
  },
  apis: ['./src/api/*.ts', './src/index.ts', './src/config/swagger-schemas.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
