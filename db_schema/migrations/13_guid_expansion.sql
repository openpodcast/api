-- Migration: increase ep_guid size from VARCHAR(64) to VARCHAR(512)
-- This allows for longer GUIDs as some hosters use URLs as GUIDs

-- Change the column size from VARCHAR(64) to VARCHAR(512)
ALTER TABLE appleEpisodeMetadata MODIFY COLUMN ep_guid VARCHAR(512) NOT NULL;

INSERT INTO migrations (migration_id, migration_name) VALUES (13, 'increase ep_guid size');