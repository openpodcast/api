DROP TABLE IF EXISTS events;
CREATE TABLE events (
  account_id INTEGER NOT NULL,
  ev_userhash CHAR(64) AS (SHA2(CONCAT_WS("",JSON_UNQUOTE(ev_raw->"$.ip"),JSON_UNQUOTE(ev_raw->'$."user-agent"')), 256)) STORED,
  ev_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ev_raw JSON,
  PRIMARY KEY (account_id, ev_timestamp)
);

DROP TABLE IF EXISTS spotifyPodcastDetailedStreams;
CREATE TABLE spotifyPodcastDetailedStreams (
  account_id INTEGER NOT NULL,
  sps_date DATE NOT NULL,
  sps_starts INTEGER NOT NULL,
  sps_streams INTEGER NOT NULL,
  PRIMARY KEY (account_id, sps_date)
);

DROP TABLE IF EXISTS spotifyEpisodeDetailedStreams;
CREATE TABLE spotifyEpisodeDetailedStreams (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  sps_date DATE NOT NULL,
  sps_starts INTEGER NOT NULL,
  sps_streams INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, sps_date)
);

DROP TABLE IF EXISTS spotifyPodcastListeners;
CREATE TABLE spotifyPodcastListeners (
  account_id INTEGER NOT NULL,
  spl_date DATE NOT NULL,
  spl_count INTEGER NOT NULL,
  PRIMARY KEY (account_id, spl_date)
);

DROP TABLE IF EXISTS spotifyPodcastFollowers;
CREATE TABLE spotifyPodcastFollowers (
  account_id INTEGER NOT NULL,
  spf_date DATE NOT NULL,
  spf_count INTEGER NOT NULL,
  PRIMARY KEY (account_id, spf_date)
);

DROP TABLE IF EXISTS spotifyEpisodeListeners;
CREATE TABLE spotifyEpisodeListeners (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  spl_date DATE NOT NULL,
  spl_count INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, spl_date)
);

DROP TABLE IF EXISTS spotifyAggregate;
CREATE TABLE spotifyAggregate (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  spa_date DATE NOT NULL,
  spa_age CHAR(8) NOT NULL,
  spa_gender_not_specified INTEGER NOT NULL,
  spa_gender_female INTEGER NOT NULL,
  spa_gender_male INTEGER NOT NULL,
  spa_gender_non_binary INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, spa_date, spa_age)
);

DROP TABLE IF EXISTS spotifyEpisodePerformance;
CREATE TABLE spotifyEpisodePerformance (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  spp_median_percentage TINYINT unsigned NOT NULL DEFAULT '0',
  spp_median_seconds MEDIUMINT unsigned NOT NULL DEFAULT '0',
  spp_percentile_25 TINYINT unsigned NOT NULL DEFAULT '0',
  spp_percentile_50 TINYINT unsigned NOT NULL DEFAULT '0',
  spp_percentile_75 TINYINT unsigned NOT NULL DEFAULT '0',
  spp_percentile_100 TINYINT unsigned NOT NULL DEFAULT '0',
  spp_sample_rate MEDIUMINT unsigned NOT NULL DEFAULT '0',
  spp_sample_max INTEGER unsigned NOT NULL DEFAULT '0',
  spp_sample_seconds INTEGER unsigned NOT NULL DEFAULT '0',
  -- detailed samples stored as json to reduce rows in DB
  -- otherwise we would add e.g. 3000 rows for just one episode  
  spp_samples JSON NOT NULL,
  PRIMARY KEY (account_id, episode_id)
);

DROP TABLE IF EXISTS spotifyPodcastMetadata;
CREATE TABLE spotifyPodcastMetadata (
  account_id INTEGER NOT NULL,
  spm_total_episodes INTEGER NOT NULL,
  spm_starts INTEGER NOT NULL,
  spm_streams INTEGER NOT NULL,
  spm_listeners INTEGER NOT NULL,
  spm_followers INTEGER NOT NULL,
  PRIMARY KEY (account_id)
);

DROP TABLE IF EXISTS spotifyEpisodeMetadata;
CREATE TABLE spotifyEpisodeMetadata (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  ep_name VARCHAR(2048) NOT NULL,
  ep_url VARCHAR(2048),
  ep_artwork_url VARCHAR(2048),
  ep_release_date DATE,
  ep_description TEXT,
  ep_explicit BOOLEAN,
  ep_duration INTEGER,
  ep_language VARCHAR(100),
  -- no clue what sparkLine is (was always empty)
  ep_spark_line JSON,
  ep_has_video BOOLEAN,
  PRIMARY KEY (account_id, episode_id)
);