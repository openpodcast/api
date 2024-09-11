CREATE TABLE IF NOT EXISTS spotifyPodcastImpressions (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  `date` DATE NOT NULL,
  impressions MEDIUMINT UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, episode_id, `date`)
);

CREATE TABLE IF NOT EXISTS spotifyPodcastImpressionsFacets (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  facet ENUM("library", "search", "home", "other") NOT NULL,
  impressions INT UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, episode_id, end_date, facet, start_date)
);

INSERT INTO migrations (migration_id, migration_name) VALUES (12, 'impressions');