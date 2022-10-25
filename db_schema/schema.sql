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
  PRIMARY KEY (account_id, sps_date)
);

DROP TABLE IF EXISTS spotifyListeners;
CREATE TABLE spotifyListeners (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  spl_date DATE NOT NULL,
  spl_count INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, spl_date)
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