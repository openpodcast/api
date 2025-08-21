# OpenPodcast API - AI Coding Agent Guide

## Architecture Overview

This is a **multi-provider podcast analytics ingestion API** that normalizes data from Spotify, Apple Podcasts, Anchor, and generic hosting providers into a unified MySQL database schema.

### Core Components

- **ConnectorApi**: Routes incoming payloads to provider-specific handlers
- **Provider Connectors** (`src/api/connectors/`): Transform external API data (Spotify, Apple, Anchor, Hoster)
- **Repositories** (`src/db/`): Handle MySQL data persistence with provider-specific schemas
- **JSON Schema Validation** (`src/schema/`): Validates incoming payloads per provider/endpoint

### Data Flow Pattern

1. **POST /connector** → ConnectorApi validates wrapper payload
2. Provider determined from `payload.provider` field
3. Endpoint-specific validation using JSON schemas (`src/schema/{provider}/{endpoint}.json`)
4. Data transformation via converter functions (`src/types/provider/{provider}.ts`)
5. MySQL storage via Repository pattern with `REPLACE INTO` statements

## Critical Development Workflows

### Testing
```bash
make e2e-tests        # Full Docker-based integration tests
make test            # Unit tests only
```

### Development
```bash
make dev             # Start dev server with hot reload
make up-db           # Start MySQL container only
make down-db         # Reset database (removes volumes)
```

### Database
- Schema: `db_schema/schema.sql` (current version)
- Migrations: `db_schema/migrations/` (incremental changes)
- Test account ID: `3` (has test data for all providers)

## Provider Integration Patterns

### Adding New Endpoints
1. **Create JSON schema**: `src/schema/{provider}/{endpoint}.json`
2. **Define types**: Add to `src/types/provider/{provider}.ts`
3. **Add validation**: Import schema in connector
4. **Implement storage**: Add method to repository
5. **Create test fixture**: `fixtures/{provider}{Endpoint}.json`
6. **Add e2e test**: `tests/api_e2e/{provider}.test.js`

### Payload Structure (Standard)
```json
{
  "provider": "spotify|apple|anchor|{hoster}",
  "version": 1,
  "retrieved": "2023-05-05T16:20:59.449713",
  "meta": {
    "show": "show_id",
    "endpoint": "endpoint_name",
    "episode": "episode_id" // optional
  },
  "range": {"start": "2023-05-01", "end": "2023-05-04"},
  "data": { /* provider-specific payload */ }
}
```

## Database Conventions

- **Multi-tenancy**: All tables include `account_id` column
- **Date handling**: Use `getTodayDBString()` for current date, MySQL DATE format
- **Replace semantics**: Use `REPLACE INTO` for upserts (overwrites existing data)
- **Promise patterns**: Return `Promise.all()` for batch operations

### Error Handling Patterns

- **Graceful degradation**: Skip saving when data is all zeros/nulls (see `AnchorConnector.aggregatedPerformance`)
- **Validation errors**: Throw `PayloadError` (returns 400) for bad requests
- **Missing data**: Check for `undefined` (required), allow `null` (valid empty value)

## Project-Specific Conventions

### Type Conversion Pattern
```typescript
// Raw external data → Typed internal data
export function convertToAnchorAggregatedPerformanceData(
    rawData: RawAnchorAggregatedPerformanceData
): AnchorAggregatedPerformanceData {
    // Transform array-based data to structured objects
    // Handle null/undefined distinction carefully
}
```

### Connector Handler Pattern
```typescript
class ProviderConnector implements ConnectorHandler {
    async handleRequest(accountId: number, payload: ConnectorPayload) {
        // 1. Validate endpoint exists
        // 2. Apply JSON schema validation
        // 3. Type-guard payload data structure
        // 4. Transform data if needed
        // 5. Store via repository
    }
}
```

### Test Fixture Requirements
- **Anonymized data**: Replace real IDs with `anonymized_*` values
- **Complete payloads**: Include all required fields per schema
- **Edge cases**: Create separate fixtures for null/zero scenarios

## Key Integration Points

- **Authentication**: Bearer token middleware (bypassed for public endpoints)
- **CORS**: Express static files served from `public/`
- **Health checks**: `/health` endpoint with database connectivity check
- **Analytics**: Dynamic SQL query execution from `db_schema/queries/`

## Critical Files to Understand

- `src/index.ts`: Express app setup, middleware, endpoint definitions
- `src/api/ConnectorApi.ts`: Provider routing and payload validation
- `src/api/connectors/{Provider}Connector.ts`: Provider-specific logic
- `fixtures/`: Complete example payloads for each provider/endpoint
- `Makefile`: All development commands and workflows
