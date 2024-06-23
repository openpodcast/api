CREATE TABLE IF NOT EXISTS hoster (
  hoster_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hoster_name VARCHAR(255) NOT NULL,
  PRIMARY KEY (hoster_id)
);

CREATE TABLE IF NOT EXISTS hosterPodcastMetadata (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  hoster_id MEDIUMINT UNSIGNED NOT NULL,
  name VARCHAR(2048) NOT NULL,
  -- Date is not part of the primary key
  -- because we only want to store the latest data
  PRIMARY KEY (account_id, hoster_id)
);

CREATE TABLE IF NOT EXISTS hosterPodcastMetrics (
  account_id INTEGER NOT NULL,
  hoster_id MEDIUMINT UNSIGNED NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  dimension ENUM(
    'downloads',
    'platforms',
    'clients',
    'sources'
  ) NOT NULL,
  subdimension VARCHAR(255) DEFAULT '' NOT NULL,
  value INTEGER NOT NULL,
  PRIMARY KEY (account_id, hoster_id, start, end, dimension, subdimension)
);

CREATE TABLE IF NOT EXISTS hosterEpisodeMetadata (
  account_id INTEGER NOT NULL,
  hoster_id MEDIUMINT UNSIGNED NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  ep_name VARCHAR(2048) NOT NULL,
  ep_url VARCHAR(2048),
  -- Date could be NULL for unpublished episodes
  ep_release_date DATETIME,
  PRIMARY KEY (account_id, hoster_id, episode_id)
);

CREATE TABLE IF NOT EXISTS hosterEpisodeMetrics (
  account_id INTEGER NOT NULL,
  hoster_id MEDIUMINT UNSIGNED NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  dimension ENUM(
    'downloads',
    'platforms',
    'clients',
    'sources'
  ) NOT NULL,
  subdimension VARCHAR(255) DEFAULT '' NOT NULL,
  value INTEGER NOT NULL,
  PRIMARY KEY (account_id, hoster_id, episode_id, start, end, dimension, subdimension)
);

INSERT INTO migrations (migration_id, migration_name) VALUES (12, 'generic hoster support');