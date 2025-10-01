-- Check if column exists before adding it
SET @col_exists = (SELECT COUNT(*)
                   FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'anchorPodcastEpisodes'
                   AND COLUMN_NAME = 'publishOn');

SET @query = IF(@col_exists = 0,
    'ALTER TABLE anchorPodcastEpisodes ADD COLUMN publishOn DATETIME DEFAULT NULL AFTER created',
    'SELECT "Column publishOn already exists" AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO migrations (migration_id, migration_name) VALUES (6, 'anchor episode publish time');