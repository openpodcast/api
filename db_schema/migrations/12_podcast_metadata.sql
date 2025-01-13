CREATE TABLE IF NOT EXISTS podcastMetadata (
  account_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  artwork_url VARCHAR(255) NOT NULL,
  release_date DATE NOT NULL,
  url VARCHAR(255) NOT NULL,
  publisher VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id)
);

INSERT INTO migrations (migration_id, migration_name) VALUES (12, 'podcast metadata');