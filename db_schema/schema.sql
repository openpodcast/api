DROP TABLE IF EXISTS events;
CREATE TABLE events (
  account_id INTEGER NOT NULL,
  ev_userhash CHAR(64) AS (SHA2(CONCAT_WS("",JSON_UNQUOTE(ev_raw->"$.ip"),JSON_UNQUOTE(ev_raw->'$."user-agent"')), 256)) STORED,
  ev_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ev_raw JSON,
  PRIMARY KEY (account_id, ev_timestamp)
);

DROP TABLE IF EXISTS spotifyDetailedStreams;
CREATE TABLE spotifyDetailedStreams (
  account_id INTEGER NOT NULL,
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

DROP TABLE IF EXISTS spotifyAggregate;
CREATE TABLE spotifyAggregate (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  spa_date DATE NOT NULL,
  spa_age VARCHAR(128) NOT NULL,
  spa_gender_not_specified INTEGER NOT NULL,
  spa_gender_female INTEGER NOT NULL,
  spa_gender_male INTEGER NOT NULL,
  spa_gender_non_binary INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, spa_date)
);