-- Migration 18: Add indexes for episodeMapping view performance optimization
-- The primary bottleneck is the episodeMapping view which joins on ep_name (VARCHAR(2048))

-- CRITICAL: Add indexes for ep_name joins in episodeMapping view
-- Using prefix indexes since ep_name is VARCHAR(2048) - most episode names are much shorter
CREATE INDEX idx_apple_episode_meta_account_name ON appleEpisodeMetadata(account_id, ep_name(255));
CREATE INDEX idx_spotify_episode_meta_account_name ON spotifyEpisodeMetadata(account_id, ep_name(255));
CREATE INDEX idx_hoster_episode_meta_account_name ON hosterEpisodeMetadata(account_id, ep_name(255));

-- Secondary: Add composite indexes for better date range filtering in main query
CREATE INDEX idx_apple_details_account_episode_date ON appleEpisodeDetails(account_id, episode_id, aed_date);
CREATE INDEX idx_spotify_meta_hist_account_episode_date ON spotifyEpisodeMetadataHistory(account_id, episode_id, epm_date);

INSERT INTO migrations (migration_id, migration_name) VALUES (18, 'episode mapping indexes');