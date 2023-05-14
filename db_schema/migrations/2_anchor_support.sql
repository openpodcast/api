CREATE TABLE IF NOT EXISTS anchorAudienceSize (
  account_id INTEGER NOT NULL,
  aas_date DATE NOT NULL,
  aas_audience_size INTEGER NOT NULL,
  PRIMARY KEY (account_id, aas_date)
);

CREATE TABLE IF NOT EXISTS anchorAggregatedPerformance (
  account_id INTEGER NOT NULL,
  aap_date DATE NOT NULL,
  aap_percentile25 INTEGER NOT NULL,
  aap_percentile50 INTEGER NOT NULL,
  aap_percentile75 INTEGER NOT NULL,
  aap_percentile100 INTEGER NOT NULL,
  aap_average_listen_seconds INTEGER NOT NULL,
  PRIMARY KEY (account_id, aap_date)
);

CREATE TABLE IF NOT EXISTS anchorEpisodePerformance (
  account_id INTEGER NOT NULL,
  aep_episode_id VARCHAR(128) NOT NULL,
  aep_date DATE NOT NULL,
  aep_sample INTEGER NOT NULL,
  aep_listeners INTEGER NOT NULL,
  PRIMARY KEY (account_id, aep_episode_id, aep_date)
);

CREATE TABLE IF NOT EXISTS anchorPlays (
  account_id INTEGER NOT NULL,
  aep_date DATE NOT NULL,
  aep_plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, aep_date)
);

CREATE TABLE IF NOT EXISTS anchorEpisodePlays (
  account_id INTEGER NOT NULL,
  aep_episode_id VARCHAR(128) NOT NULL,
  aep_date DATE NOT NULL,
  aep_plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, aep_episode_id, aep_date)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByAgeRange (
  account_id INTEGER NOT NULL,
  apbar_date DATE NOT NULL,
  apbar_age_range VARCHAR(128) NOT NULL,
  apbar_plays_percent INTEGER NOT NULL,
  PRIMARY KEY (account_id, apbar_date, apbar_age_range)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByApp (
  account_id INTEGER NOT NULL,
  apba_date DATE NOT NULL,
  apba_app VARCHAR(128) NOT NULL,
  apba_plays_percent INTEGER NOT NULL,
  PRIMARY KEY (account_id, apba_date, apba_app)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByDevice(
  account_id INTEGER NOT NULL,
  apbd_date DATE NOT NULL,
  apbd_device VARCHAR(128) NOT NULL,
  apbd_plays_percent INTEGER NOT NULL,
  PRIMARY KEY (account_id, apbd_date, apbd_device)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByEpisode (
  account_id INTEGER NOT NULL,
  apbe_date DATE NOT NULL,
  apbe_episode_id VARCHAR(128) NOT NULL,
  apbe_plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, apbe_date, apbe_episode_id)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByGender (
  account_id INTEGER NOT NULL,
  apbg_date DATE NOT NULL,
  apbg_gender VARCHAR(128) NOT NULL,
  apbg_plays_percent INTEGER NOT NULL,
  PRIMARY KEY (account_id, apbg_date, apbg_gender)
);

CREATE TABLE IF NOT EXISTS anchorPlaysByGeo (
  account_id INTEGER NOT NULL,
  apbg_date DATE NOT NULL,
  apbg_geo VARCHAR(128) NOT NULL,
  apbg_plays_percent INTEGER NOT NULL,
  PRIMARY KEY (account_id, apbg_date, apbg_geo)
);

CREATE TABLE IF NOT EXISTS anchorPodcastEpisodes (
    account_id INTEGER NOT NULL,
    ape_podcast_id VARCHAR(128) NOT NULL,
    ape_episode_id VARCHAR(128) NOT NULL,
    ape_date DATETIME NOT NULL,
    ape_title VARCHAR(255) NOT NULL,
    ape_description TEXT,
    ape_url VARCHAR(512) NOT NULL,
    ape_tracked_url VARCHAR(512),
    ape_episode_image VARCHAR(512),
    ape_share_link_path VARCHAR(512) NOT NULL,
    ape_share_link_embed_path VARCHAR(512) NOT NULL,
    ape_ad_count INTEGER NOT NULL,
    ape_created DATETIME NOT NULL,
    ape_duration BIGINT NOT NULL,
    ape_hour_offset INTEGER NOT NULL,
    ape_is_deleted BOOLEAN NOT NULL,
    ape_is_published BOOLEAN NOT NULL,
    PRIMARY KEY (account_id, ape_episode_id)
);

CREATE TABLE IF NOT EXISTS anchorTotalPlays (
  account_id INTEGER NOT NULL,
  atp_date DATE NOT NULL,
  atp_plays INTEGER NOT NULL,
  PRIMARY KEY (account_id, atp_date)
);

CREATE TABLE IF NOT EXISTS anchorTotalPlaysByEpisode (
    account_id INTEGER NOT NULL,
    atpbe_date DATE NOT NULL,
    atpbe_episode_id VARCHAR(255) NOT NULL,
    atpbe_plays INTEGER NOT NULL,
    PRIMARY KEY (account_id, atpbe_date, atpbe_episode_id)
);

CREATE TABLE IF NOT EXISTS anchorUniqueListeners (
    account_id INTEGER NOT NULL,
    aul_date DATE NOT NULL,
    aul_unique_listeners INTEGER NOT NULL,
    PRIMARY KEY (account_id, aul_date)
);

