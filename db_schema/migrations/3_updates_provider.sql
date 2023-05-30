-- add column to store provider when inserting data
ALTER TABLE updates ADD COLUMN provider VARCHAR(64) NOT NULL DEFAULT 'unknown' AFTER account_id;