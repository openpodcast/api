-- Migration 18: Add indexes for episodeMapping view performance optimization
-- The primary bottleneck is the episodeMapping view which joins on ep_name (VARCHAR(2048))

-- CRITICAL: Add indexes for ep_name joins in episodeMapping view
-- Using prefix indexes since ep_name is VARCHAR(2048) - most episode names are much shorter
CREATE INDEX idx_apple_episode_meta_account_name ON appleEpisodeMetadata(account_id, ep_name(255));
CREATE INDEX idx_spotify_episode_meta_account_name ON spotifyEpisodeMetadata(account_id, ep_name(255));
CREATE INDEX idx_hoster_episode_meta_account_name ON hosterEpisodeMetadata(account_id, ep_name(255));

INSERT INTO migrations (migration_id, migration_name) VALUES (18, 'episode mapping indexes');