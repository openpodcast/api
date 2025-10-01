import fs from 'fs';
import path from 'path';

/**
 * Generates OpenAPI documentation for SQL query endpoints
 * Reads SQL files from db_schema/queries/v1/ and creates endpoint specs
 */

const QUERIES_DIR = path.join(__dirname, '../../db_schema/queries/v1');

// Category mappings based on query name patterns
const categorizeQuery = (queryName: string): string => {
  if (queryName.includes('Spotify') || queryName.includes('spotify')) return 'Spotify';
  if (queryName.includes('Apple') || queryName.includes('apple')) return 'Apple Podcasts';
  if (queryName.includes('Hoster') || queryName.includes('hoster')) return 'Hoster';
  if (queryName.includes('episodes') || queryName.includes('Episodes')) return 'Episodes';
  if (queryName.includes('podcast') || queryName.includes('Podcast')) return 'Podcast';
  if (queryName.includes('charts') || queryName.includes('Charts')) return 'Charts';
  if (queryName.includes('Anchor') || queryName.includes('anchor')) return 'Anchor (Legacy)';
  return 'Other';
};

// Extract description from SQL comment at the top of file
const extractDescription = (sqlContent: string): string => {
  const lines = sqlContent.split('\n');
  const commentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--')) {
      commentLines.push(trimmed.substring(2).trim());
    } else if (trimmed && !trimmed.startsWith('--')) {
      break; // Stop at first non-comment, non-empty line
    }
  }

  return commentLines.join(' ') || 'Analytics query endpoint';
};

export const generateQueryDocs = () => {
  const queries: any[] = [];

  if (!fs.existsSync(QUERIES_DIR)) {
    console.warn(`Queries directory not found: ${QUERIES_DIR}`);
    return queries;
  }

  const files = fs.readdirSync(QUERIES_DIR).filter(f => f.endsWith('.sql'));

  for (const file of files) {
    const queryName = file.replace('.sql', '');
    const filePath = path.join(QUERIES_DIR, file);
    const sqlContent = fs.readFileSync(filePath, 'utf-8');
    const description = extractDescription(sqlContent);
    const category = categorizeQuery(queryName);

    queries.push({
      name: queryName,
      category,
      description,
      path: `/analytics/v1/{podcastId}/${queryName}`,
    });
  }

  return queries;
};

// Generate OpenAPI paths object for all queries
export const generateQueryPaths = () => {
  const queries = generateQueryDocs();
  const paths: any = {};

  // Group by category for better organization
  const byCategory = queries.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, typeof queries>);

  for (const query of queries) {
    paths[query.path] = {
      get: {
        summary: query.name,
        description: query.description,
        tags: [query.category],
        parameters: [
          {
            name: 'podcastId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'Podcast ID',
          },
          {
            name: 'start',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date', example: '2024-01-01' },
            description: 'Start date (YYYY-MM-DD)',
          },
          {
            name: 'end',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date', example: '2024-12-31' },
            description: 'End date (YYYY-MM-DD)',
          },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Query results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    meta: {
                      type: 'object',
                      properties: {
                        query: { type: 'string' },
                        podcastId: { type: 'string' },
                        startDate: { type: 'string', format: 'date' },
                        endDate: { type: 'string', format: 'date' },
                      },
                    },
                    data: {
                      type: 'array',
                      items: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    // Also add CSV endpoint
    paths[`${query.path}/csv`] = {
      get: {
        summary: `${query.name} (CSV)`,
        description: `${query.description} Returns data in CSV format.`,
        tags: [query.category],
        parameters: [
          {
            name: 'podcastId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'start',
            in: 'query',
            schema: { type: 'string', format: 'date' },
          },
          {
            name: 'end',
            in: 'query',
            schema: { type: 'string', format: 'date' },
          },
        ],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'CSV data',
            content: {
              'text/csv': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    };
  }

  return { paths, categories: Object.keys(byCategory) };
};
