-- Migration 16: Add provider ID columns to podcasts table
-- This migration adds four new columns to store provider-specific IDs
-- and populates them from the openpodcast_auth.podcastSources table

-- Add the new columns to the podcasts table
ALTER TABLE podcasts 
ADD COLUMN spotify_id VARCHAR(64) NULL,
ADD COLUMN apple_id VARCHAR(64) NULL,
ADD COLUMN podigee_id VARCHAR(64) NULL,
ADD COLUMN anchor_id VARCHAR(64) NULL;

-- Populate the new columns from the openpodcast_auth.podcastSources table
UPDATE podcasts p
LEFT JOIN openpodcast_auth.podcastSources ps_spotify 
    ON p.account_id = ps_spotify.account_id 
    AND ps_spotify.source_name = 'spotify'
LEFT JOIN openpodcast_auth.podcastSources ps_apple 
    ON p.account_id = ps_apple.account_id 
    AND ps_apple.source_name = 'apple'
LEFT JOIN openpodcast_auth.podcastSources ps_podigee 
    ON p.account_id = ps_podigee.account_id 
    AND ps_podigee.source_name = 'podigee'
LEFT JOIN openpodcast_auth.podcastSources ps_anchor 
    ON p.account_id = ps_anchor.account_id 
    AND ps_anchor.source_name = 'anchor'
SET 
    p.spotify_id = ps_spotify.source_podcast_id,
    p.apple_id = ps_apple.source_podcast_id,
    p.podigee_id = ps_podigee.source_podcast_id,
    p.anchor_id = ps_anchor.source_podcast_id;

-- Record this migration as completed
INSERT INTO migrations (migration_id, migration_name) VALUES (16, 'podcasts provider ids');
