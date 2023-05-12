CREATE TABLE IF NOT EXISTS anchorAudienceSize (
  account_id INTEGER NOT NULL,
  aas_date DATE NOT NULL,
  aas_audience_size INTEGER NOT NULL,
  PRIMARY KEY (account_id, aas_date)
);

CREATE TABLE IF NOT EXISTS anchorEpisodeMetadata (
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
  PRIMARY KEY (account_id, episode_id)
);

CREATE TABLE IF NOT EXISTS anchorEpisodeDetails (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  aed_date DATE NOT NULL,
  aed_playscount INTEGER NOT NULL,
  aed_totaltimelistened BIGINT NOT NULL,
  aed_uniqueengagedlistenerscount INTEGER NOT NULL,
  aed_uniquelistenerscount INTEGER NOT NULL,
  aed_play_histogram JSON,
  aed_play_top_cities JSON,
  aed_play_top_countries JSON,
  PRIMARY KEY (account_id, episode_id, aed_date)
);

CREATE TABLE IF NOT EXISTS anchorTrendsEpisodeListeners (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  atl_date DATE NOT NULL,
  atl_playscount INTEGER NOT NULL,
  atl_totaltimelistened BIGINT NOT NULL,
  atl_uniqueengagedlistenerscount INTEGER NOT NULL,
  atl_uniquelistenerscount INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, atl_date)
);

CREATE TABLE IF NOT EXISTS anchorTrendsPodcastListeners (
  account_id INTEGER NOT NULL,
  atl_date DATE NOT NULL,
  atl_playscount INTEGER NOT NULL,
  atl_totaltimelistened BIGINT NOT NULL,
  atl_uniqueengagedlistenerscount INTEGER NOT NULL,
  atl_uniquelistenerscount INTEGER NOT NULL,
  PRIMARY KEY (account_id, atl_date)
);

CREATE TABLE IF NOT EXISTS anchorTrendsPodcastListeningTimeFollowerState (
  account_id INTEGER NOT NULL,
  atf_date DATE NOT NULL,
  atf_totaltimelistened_followers BIGINT NOT NULL,
  atf_totaltimelistened_nonfollowers BIGINT NOT NULL,
  PRIMARY KEY (account_id, atf_date)
);

CREATE TABLE IF NOT EXISTS anchorTrendsPodcastFollowers (
  account_id INTEGER NOT NULL,
  atf_date DATE NOT NULL,
  atf_totalfollowers INTEGER NOT NULL,
  atf_gained INTEGER NOT NULL,
  atf_lost INTEGER NOT NULL,
  PRIMARY KEY (account_id, atf_date)
);
