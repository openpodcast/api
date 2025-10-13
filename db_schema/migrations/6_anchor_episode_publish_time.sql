ALTER TABLE anchorPodcastEpisodes ADD COLUMN publishOn DATETIME DEFAULT NULL AFTER created;

INSERT INTO migrations (migration_id, migration_name) VALUES (6, 'anchor episode publish time');