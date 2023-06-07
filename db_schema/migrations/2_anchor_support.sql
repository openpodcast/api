CREATE TABLE IF NOT EXISTS anchorAudienceSize (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  audience_size INTEGER NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS anchorAggregatedPerformance (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  percentile25 INTEGER NOT NULL,
  percentile50 INTEGER NOT NULL,
  percentile75 INTEGER NOT NULL,
  percentile100 INTEGER NOT NULL,
  average_listen_seconds INTEGER NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS anchorEpisodePerformance (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  date DATE NOT NULL,
  max_listeners INTEGER NOT NULL,
  samples JSON NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);

CREATE TABLE IF NOT EXISTS anchorPlays (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS anchorEpisodePlays (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  date DATE NOT NULL,
  plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByAgeRange (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  age_range VARCHAR(128) NOT NULL,
  plays_percent INTEGER NOT NULL,
  PRIMARY KEY (account_id, date, age_range)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByApp (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  app VARCHAR(128) NOT NULL,
  plays_percent INTEGER NOT NULL,
  PRIMARY KEY (account_id, date, app)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByDevice(
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  device VARCHAR(128) NOT NULL,
  plays_percent INTEGER NOT NULL,
  PRIMARY KEY (account_id, date, device)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByEpisode (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, date, episode_id)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByGender (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  gender VARCHAR(128) NOT NULL,
  plays_percent INTEGER NOT NULL,
  PRIMARY KEY (account_id, date, gender)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByGeo (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  geo VARCHAR(128) NOT NULL,
  plays_percent INTEGER NOT NULL,
  PRIMARY KEY (account_id, date, geo)
);

CREATE TABLE IF NOT EXISTS anchorPodcastEpisodes (
  account_id INTEGER NOT NULL,
  podcast_id VARCHAR(128) NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  date DATETIME NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(512) NOT NULL,
  tracked_url VARCHAR(512),
  episode_image VARCHAR(512),
  share_link_path VARCHAR(512) NOT NULL,
  share_link_embed_path VARCHAR(512) NOT NULL,
  ad_count INTEGER NOT NULL,
  created DATETIME NOT NULL,
  duration BIGINT NOT NULL,
  hour_offset INTEGER NOT NULL,
  is_deleted BOOLEAN NOT NULL,
  is_published BOOLEAN NOT NULL,
  PRIMARY KEY (account_id, episode_id)
);

CREATE TABLE IF NOT EXISTS anchorTotalPlays (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS anchorTotalPlaysByEpisode (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  episode_id VARCHAR(255) NOT NULL,
  plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, date, episode_id)
);

CREATE TABLE IF NOT EXISTS anchorUniqueListeners (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  unique_listeners INTEGER NOT NULL,
  PRIMARY KEY (account_id, date)
);

INSERT INTO migrations (migration_id, migration_name) VALUES (2, 'anchor support');