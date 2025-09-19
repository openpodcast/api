-- Migration 18: Add composite indexes for episodeMapping performance optimization
-- Improves query performance for episodesTotalMetrics.sql and similar queries

-- Add composite indexes for efficient joins in episodeMapping view
CREATE INDEX idx_apple_episode_meta_name ON appleEpisodeMetadata(account_id, ep_name, episode_id);
CREATE INDEX idx_spotify_episode_meta_name ON spotifyEpisodeMetadata(account_id, ep_name, episode_id);

-- Add composite indexes for better date range filtering
CREATE INDEX idx_apple_details_account_episode_date ON appleEpisodeDetails(account_id, episode_id, aed_date);
CREATE INDEX idx_spotify_meta_hist_account_episode_date ON spotifyEpisodeMetadataHistory(account_id, episode_id, epm_date);

INSERT INTO migrations (migration_id, migration_name) VALUES (18, 'episode mapping indexes');