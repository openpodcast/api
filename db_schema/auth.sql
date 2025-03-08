-- tables will be created in separated auth database

-- IMPORTANT: this is just the schema which is also not autodeployed
-- as it should live in a separated database to be more flexible
-- with access permissions.

-- define access keys for podcast sources
CREATE TABLE IF NOT EXISTS podcastSources (
  account_id INTEGER NOT NULL,
  source_name ENUM('spotify','apple','anchor'),
  source_podcast_id VARCHAR(64) NOT NULL,
  -- keys are stored in json format and are encrypted by the client
  source_access_keys_encrypted JSON NOT NULL,
  source_access_keys_created TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (account_id, source_name)
);

ALTER TABLE podcastSources
ADD CONSTRAINT podcastSources_account_id_fk
FOREIGN KEY (account_id) REFERENCES openpodcast.podcasts(account_id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS apiKeys (
  -- SHA256 hash of the key, no salting as we are storing long random keys
  -- and the hash is used to lookup the key which would be more complicated using salting
  -- and wouldn't increase security a lot
  key_hash CHAR(64) NOT NULL,
  account_id INTEGER NOT NULL,
  PRIMARY KEY (key_hash, account_id)
);
ALTER TABLE apiKeys
ADD CONSTRAINT apiKeys_account_id_fk
FOREIGN KEY (account_id) REFERENCES openpodcast.accounts(id) ON DELETE CASCADE;