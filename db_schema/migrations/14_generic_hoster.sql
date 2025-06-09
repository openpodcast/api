CREATE TABLE IF NOT EXISTS hosterPodcastMetadata (
  account_id INTEGER NOT NULL,
  hoster_id SMALLINT UNSIGNED NOT NULL,
  date DATE DEFAULT (CURRENT_DATE),
  name VARCHAR(2048) NOT NULL,
  -- Date is not part of the primary key
  -- because we only want to store the latest data
  PRIMARY KEY (account_id, hoster_id)
);

CREATE TABLE IF NOT EXISTS subdimensions (
    dim_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
    dim_name CHAR(64) NOT NULL,
    PRIMARY KEY (dim_id),
    UNIQUE KEY (dim_name)
);

CREATE TABLE IF NOT EXISTS hosterPodcastMetrics (
  account_id INTEGER NOT NULL,
  hoster_id SMALLINT UNSIGNED NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  dimension ENUM(
    'downloads',
    'platforms',
    'clients',
    'sources'
  ) NOT NULL,
  subdimension SMALLINT UNSIGNED NOT NULL,
  value INTEGER NOT NULL,
  PRIMARY KEY (account_id, hoster_id, start, end, dimension, subdimension),
  CONSTRAINT fk_subdimension_podcast
    FOREIGN KEY (subdimension) REFERENCES subdimensions(dim_id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS hosterEpisodeMetadata (
  account_id INTEGER NOT NULL,
  hoster_id SMALLINT UNSIGNED NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  ep_name VARCHAR(2048) NOT NULL,
  ep_url VARCHAR(2048),
  -- Date could be NULL for unpublished episodes
  ep_release_date DATETIME,
  PRIMARY KEY (account_id, hoster_id, episode_id)
);

CREATE TABLE IF NOT EXISTS hosterEpisodeMetrics (
  account_id INTEGER NOT NULL,
  hoster_id SMALLINT UNSIGNED NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  dimension ENUM(
    'downloads',
    'platforms',
    'clients',
    'sources'
  ) NOT NULL,
  subdimension SMALLINT UNSIGNED NOT NULL,
  value INTEGER NOT NULL,
  PRIMARY KEY (account_id, hoster_id, episode_id, start, end, dimension, subdimension),
    CONSTRAINT fk_subdimension_episode
        FOREIGN KEY (subdimension) REFERENCES subdimensions(dim_id)
        ON DELETE RESTRICT
);

INSERT INTO migrations (migration_id, migration_name) VALUES (14, 'genericHoster');