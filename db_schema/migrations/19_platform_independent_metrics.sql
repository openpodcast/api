-- Migration 19: platform independent metrics schema (used by v2 API)
-- NOTE: the file name must not contain digits after the migration number
-- Platform independent structure with own podcast and episode ids,
-- mapping tables to platform ids and metric tables based on date ranges.
-- Starts with Spotify plays (= Spotify streams) and backfills the existing history.
-- NOTE: statements are split by semicolon, so do not use semicolons in comments or strings

-- platforms data is fetched from (ids are referenced in code, see src/types/metrics.ts)
CREATE TABLE IF NOT EXISTS platforms (
  platform_id TINYINT UNSIGNED NOT NULL,
  name VARCHAR(32) NOT NULL,
  PRIMARY KEY (platform_id),
  UNIQUE KEY (name)
);

INSERT INTO platforms (platform_id, name) VALUES
  (1, 'spotify'),
  (2, 'apple'),
  (3, 'anchor'),
  (4, 'podigee');

-- metric definitions (ids are referenced in code, see src/types/metrics.ts)
-- additive metrics (e.g. plays) are stored as daily values and can be summed up
-- non additive metrics (e.g. unique listeners) are stored with explicit date ranges
CREATE TABLE IF NOT EXISTS metrics (
  metric_id SMALLINT UNSIGNED NOT NULL,
  name VARCHAR(64) NOT NULL,
  additive BOOLEAN NOT NULL,
  PRIMARY KEY (metric_id),
  UNIQUE KEY (name)
);

INSERT INTO metrics (metric_id, name, additive) VALUES
  (1, 'plays', 1);

-- episodes with an id which is unique across all podcasts
CREATE TABLE IF NOT EXISTS episodes (
  episode_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  podcast_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (episode_id),
  KEY (podcast_id)
);

-- maps the podcast id (podcasts.account_id) to the id of the podcast on a platform
CREATE TABLE IF NOT EXISTS podcastPlatformIds (
  podcast_id INTEGER NOT NULL,
  platform_id TINYINT UNSIGNED NOT NULL,
  platform_podcast_id VARCHAR(128) NOT NULL,
  PRIMARY KEY (podcast_id, platform_id),
  KEY (platform_id, platform_podcast_id)
);

-- maps the id of an episode on a platform to our episode id
-- scoped by podcast as the same platform show might be connected to multiple podcasts
CREATE TABLE IF NOT EXISTS episodePlatformIds (
  podcast_id INTEGER NOT NULL,
  platform_id TINYINT UNSIGNED NOT NULL,
  platform_episode_id VARCHAR(128) NOT NULL,
  episode_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (podcast_id, platform_id, platform_episode_id),
  KEY (episode_id)
);

-- metric values of a podcast for a date range
-- daily values: start_date = end_date
-- lifetime values: start_date = release date, end_date = date the data was fetched
CREATE TABLE IF NOT EXISTS podcastMetrics (
  podcast_id INTEGER NOT NULL,
  metric_id SMALLINT UNSIGNED NOT NULL,
  platform_id TINYINT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  value BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (podcast_id, metric_id, platform_id, start_date, end_date)
);

-- metric values of an episode for a date range (same semantics as podcastMetrics)
CREATE TABLE IF NOT EXISTS episodeMetrics (
  episode_id INT UNSIGNED NOT NULL,
  metric_id SMALLINT UNSIGNED NOT NULL,
  platform_id TINYINT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  value BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (episode_id, metric_id, platform_id, start_date, end_date)
);

-- backfill podcast platform ids from the podcasts table
INSERT IGNORE INTO podcastPlatformIds (podcast_id, platform_id, platform_podcast_id)
SELECT account_id, 1, spotify_id FROM podcasts WHERE spotify_id IS NOT NULL AND spotify_id <> ''
UNION ALL
SELECT account_id, 2, apple_id FROM podcasts WHERE apple_id IS NOT NULL AND apple_id <> ''
UNION ALL
SELECT account_id, 3, anchor_id FROM podcasts WHERE anchor_id IS NOT NULL AND anchor_id <> ''
UNION ALL
SELECT account_id, 4, podigee_id FROM podcasts WHERE podigee_id IS NOT NULL AND podigee_id <> '';

-- backfill episode ids for all known Spotify episodes
-- the tables are empty, so ids can be assigned by row number
INSERT INTO episodePlatformIds (podcast_id, platform_id, platform_episode_id, episode_id)
SELECT account_id, 1, episode_id, ROW_NUMBER() OVER (ORDER BY account_id, episode_id)
FROM (
  SELECT account_id, episode_id FROM spotifyEpisodeMetadata
  UNION
  SELECT DISTINCT account_id, episode_id FROM spotifyEpisodeDetailedStreams
) spotifyEpisodes
WHERE episode_id IS NOT NULL AND episode_id <> '';

-- auto increment continues after the highest inserted id
INSERT INTO episodes (episode_id, podcast_id)
SELECT episode_id, podcast_id FROM episodePlatformIds;

-- backfill daily Spotify plays (= streams)
INSERT INTO podcastMetrics (podcast_id, metric_id, platform_id, start_date, end_date, value)
SELECT account_id, 1, 1, sps_date, sps_date, sps_streams
FROM spotifyPodcastDetailedStreams
WHERE sps_streams IS NOT NULL AND sps_streams >= 0;

INSERT INTO episodeMetrics (episode_id, metric_id, platform_id, start_date, end_date, value)
SELECT m.episode_id, 1, 1, s.sps_date, s.sps_date, s.sps_streams
FROM spotifyEpisodeDetailedStreams s
JOIN episodePlatformIds m
  ON m.podcast_id = s.account_id
  AND m.platform_id = 1
  AND m.platform_episode_id = s.episode_id
WHERE s.sps_streams IS NOT NULL AND s.sps_streams >= 0;

INSERT INTO migrations (migration_id, migration_name) VALUES (19, 'v2 metrics');
