-- tables will be created in separated auth database

-- TODO: this is just the schema which is also not autodeployed
-- as it should live in a separated database to be more flexible
-- with access permissions.

-- define access keys for podcast sources
CREATE TABLE IF NOT EXISTS podcastSources (
  account_id INTEGER NOT NULL,
  source_name ENUM('spotify','apple','anchor'),
  source_podcast_id VARCHAR(64) NOT NULL,
  -- keys are stored in json format and are encrypted by the client
  source_access_keys_encrypted JSON NOT NULL,
  PRIMARY KEY (account_id, source_name)
);

ALTER TABLE podcastSources
ADD CONSTRAINT podcastSources_account_id_fk
FOREIGN KEY (account_id) REFERENCES openpodcast.podcasts(account_id) ON DELETE CASCADE;

-- TODO: api permissions are not used yet
-- access to DB user of api should be restricted to readable

-- table to manage all keys of all internal apis
-- CREATE TABLE IF NOT EXISTS apiKeys (
--   key_id INTEGER NOT NULL AUTO_INCREMENT,
--   -- SHA256 hash of the key, no salting as we are storing long random keys
--   -- and the hash is used to lookup the key which would be more complicated using salting
--   -- and wouldn't increase security a lot
--   key_hash CHAR(64) NOT NULL,
--   PRIMARY KEY (key_hash),
--   INDEX id_hash_idx (key_id, key_hash)
-- );

-- define permissions of different api keys

-- CREATE TABLE IF NOT EXISTS apiKeysPermissions (
--   key_id INTEGER NOT NULL,
--   account_id INTEGER NOT NULL, -- is podcast id and should be renamed
--   permission_pushevents BOOLEAN NOT NULL DEFAULT FALSE,
--   permission_api_read BOOLEAN NOT NULL DEFAULT FALSE,
--   PRIMARY KEY (key_id, account_id),
--   INDEX (account_id)
-- );

-- ALTER TABLE apiKeysPermissions
-- ADD CONSTRAINT apiKeysPermissions_key_id_fk
-- FOREIGN KEY (key_id) REFERENCES apiKeys(key_id) ON DELETE CASCADE;

-- ALTER TABLE apiKeysPermissions
-- ADD CONSTRAINT apiKeysPermissions_account_id_fk
-- FOREIGN KEY (account_id) REFERENCES openpodcast.podcasts(account_id) ON DELETE CASCADE;