-- store the user agent as well to detect bot votes
ALTER TABLE feedbackVote ADD COLUMN IF NOT EXISTS agent VARCHAR(255) NOT NULL AFTER user_hash;

INSERT INTO migrations (migration_id, migration_name) VALUES (10, 'voting agent');