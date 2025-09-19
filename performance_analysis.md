# Performance Analysis: episodesTotalMetrics Query

## Root Cause Analysis

After analyzing the query structure and reviewing the episodeMapping view, the primary performance issue is:

### The episodeMapping VIEW bottleneck:
```sql
CREATE OR REPLACE VIEW episodeMapping AS
SELECT
  account_id, ep_name,
  spotify.episode_id as spotify_episode_id,
  apple.episode_id as apple_episode_id,
  ep_guid as guid,
  hoster.hoster_id as hoster_id,
  hoster.episode_id as hoster_episode_id
FROM
  spotifyEpisodeMetadata spotify
  JOIN appleEpisodeMetadata apple USING (account_id, ep_name)  -- ⚠️ PROBLEM!
  LEFT JOIN hosterEpisodeMetadata hoster USING (account_id, ep_name);
```

**The issue**: Joining on `ep_name` (VARCHAR(2048)) is extremely expensive for large datasets.

## EXPLAIN Analysis Points

When running EXPLAIN on the main query, we should see:
1. **Full table scans** on the episodeMapping view
2. **Nested loop joins** due to the VARCHAR(2048) join condition
3. **No effective index usage** for the ep_name joins

## Recommended Optimizations (Priority Order)

### 1. HIGH IMPACT: Add proper indexes for ep_name joins
```sql
-- These will actually help the episodeMapping view performance
CREATE INDEX idx_apple_episode_meta_account_name ON appleEpisodeMetadata(account_id, ep_name(255));
CREATE INDEX idx_spotify_episode_meta_account_name ON spotifyEpisodeMetadata(account_id, ep_name(255));
CREATE INDEX idx_hoster_episode_meta_account_name ON hosterEpisodeMetadata(account_id, ep_name(255));
```

### 2. MEDIUM IMPACT: Optimize the main query joins
The current optimization (adding date filters to JOINs) is good but secondary to the view issue.

### 3. LONG-TERM: Consider materializing episodeMapping
Instead of a view, create a table with:
- Composite primary key
- Proper indexes
- Updated via triggers or scheduled jobs

## Current Index Status
Need to verify what indexes currently exist for `ep_name` columns.

## Testing Strategy
1. Run EXPLAIN on current query
2. Add ep_name indexes
3. Run EXPLAIN again to compare
4. Measure actual execution time with sample data