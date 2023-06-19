-- add column to store provider when inserting data
ALTER TABLE updates ADD COLUMN provider VARCHAR(64) NOT NULL DEFAULT 'unknown' AFTER account_id;

INSERT INTO migrations (migration_id, migration_name) VALUES (3, 'updates stats including provider');