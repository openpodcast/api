import swaggerJsdoc from 'swagger-jsdoc'
import { generateQueryPaths } from './generate-query-docs'

// Use hardcoded version to avoid rootDir issues with package.json import
const version = '1.0.0'

// Calculate dynamic date (2 days ago)
export const getTwoDaysAgo = (): string => {
    const date = new Date()
    date.setDate(date.getDate() - 2)
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

const { paths: queryPaths, categories } = generateQueryPaths()

const servers = [
    {
        url: 'https://api.openpodcast.dev',
        description: 'OpenPodcast API',
    },
]

if (process.env.NODE_ENV !== 'production') {
    servers.push({
        url: 'http://localhost:8080',
        description: 'Local development server',
    })
}

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Open Podcast Analytics API',
            version: version,
            description:
                'Podcast analytics API providing metrics from Spotify, Apple Podcasts, and custom hosting providers.',
            contact: {
                name: 'Open Podcast Developer Documentation',
                url: 'https://openpodcast.dev',
                email: 'echo@openpodcast.dev',
            },
            license: {
                name: 'MIT',
                url: 'https://github.com/openpodcast/api/blob/main/LICENSE',
            },
        },
        servers,
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
                        example: getTwoDaysAgo(),
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
                        example: getTwoDaysAgo(),
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
            ...categories.map((cat) => ({
                name: cat,
                description: `${cat} analytics endpoints`,
            })),
        ],
        paths: queryPaths,
    },
    apis: ['./src/api/*.ts', './src/index.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
