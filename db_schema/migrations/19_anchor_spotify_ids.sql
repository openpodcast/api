-- Migration 19: Unify Anchor episode IDs to Spotify base62 format
-- 
-- Background: Anchor uses multiple ID formats for episodes:
--   1. Numeric IDs (e.g., 67347583) - used in anchorTotalPlaysByEpisode, anchorEpisodesPage
--   2. Web episode IDs (e.g., e215pm4) - used in anchorPodcastEpisodes, anchorAggregatedPerformance, 
--      anchorEpisodePerformance, anchorEpisodePlays
--   3. Spotify base62 IDs (e.g., 6PevkuxlaCBQnXfKyTgU7G) - available in tracked_url and spotify URIs
--
-- This migration unifies all episode_id columns to use the Spotify base62 format.
-- The anchorEpisodesPage mapping table is dropped as it's no longer needed.

-- Step 1: Create a temporary mapping table from web_episode_id to spotify base62 ID
-- This extracts the Spotify ID from tracked_url in anchorPodcastEpisodes
CREATE TEMPORARY TABLE tmp_episode_id_map AS
SELECT 
  pe.account_id,
  pe.episode_id AS web_episode_id,
  SUBSTRING_INDEX(pe.tracked_url, '/', -1) AS spotify_id
FROM anchorPodcastEpisodes pe
WHERE pe.tracked_url LIKE 'https://open.spotify.com/episode/%'
  AND LENGTH(SUBSTRING_INDEX(pe.tracked_url, '/', -1)) = 22;

-- Also add numeric-to-spotify mappings via anchorEpisodesPage
CREATE TEMPORARY TABLE tmp_numeric_id_map AS
SELECT 
  ep.account_id,
  CAST(ep.episode_id AS CHAR) AS numeric_episode_id,
  m.spotify_id
FROM anchorEpisodesPage ep
JOIN tmp_episode_id_map m 
  ON ep.account_id = m.account_id AND ep.web_episode_id = m.web_episode_id;

-- Step 2: Update anchorAggregatedPerformance - web episode IDs to Spotify base62
UPDATE anchorAggregatedPerformance ap
JOIN tmp_episode_id_map m 
  ON ap.account_id = m.account_id AND ap.episode_id = m.web_episode_id
SET ap.episode_id = m.spotify_id;

-- Step 3: Update anchorEpisodePerformance - web episode IDs to Spotify base62
UPDATE anchorEpisodePerformance ep2
JOIN tmp_episode_id_map m 
  ON ep2.account_id = m.account_id AND ep2.episode_id = m.web_episode_id
SET ep2.episode_id = m.spotify_id;

-- Step 4: Update anchorEpisodePlays - web episode IDs to Spotify base62
UPDATE anchorEpisodePlays epl
JOIN tmp_episode_id_map m 
  ON epl.account_id = m.account_id AND epl.episode_id = m.web_episode_id
SET epl.episode_id = m.spotify_id;

-- Step 5: Update anchorTotalPlaysByEpisode - numeric IDs to Spotify base62
UPDATE anchorTotalPlaysByEpisode tpe
JOIN tmp_numeric_id_map m 
  ON tpe.account_id = m.account_id AND tpe.episode_id = m.numeric_episode_id
SET tpe.episode_id = m.spotify_id;

-- Step 6: Update anchorPodcastEpisodes - web episode IDs to Spotify base62
UPDATE anchorPodcastEpisodes pe
JOIN tmp_episode_id_map m 
  ON pe.account_id = m.account_id AND pe.episode_id = m.web_episode_id
SET pe.episode_id = m.spotify_id;

-- Clean up temporary tables
DROP TEMPORARY TABLE IF EXISTS tmp_episode_id_map;
DROP TEMPORARY TABLE IF EXISTS tmp_numeric_id_map;

-- Step 6: Drop the anchorEpisodesPage mapping table (no longer needed)
DROP TABLE IF EXISTS anchorEpisodesPage;

-- Step 7: Record migration
INSERT INTO migrations (migration_id, migration_name) VALUES (19, 'anchor_spotify_ids');
