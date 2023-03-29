CREATE TABLE IF NOT EXISTS events (
  account_id INTEGER NOT NULL,
  ev_userhash CHAR(64) AS (SHA2(CONCAT_WS("",JSON_UNQUOTE(ev_raw->"$.ip"),JSON_UNQUOTE(ev_raw->'$."user-agent"')), 256)) STORED,
  ev_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ev_raw JSON,
  PRIMARY KEY (account_id, ev_timestamp)
);

CREATE TABLE IF NOT EXISTS spotifyPodcastDetailedStreams (
  account_id INTEGER NOT NULL,
  sps_date DATE NOT NULL,
  sps_starts INTEGER NOT NULL,
  sps_streams INTEGER NOT NULL,
  PRIMARY KEY (account_id, sps_date)
);

CREATE TABLE IF NOT EXISTS spotifyEpisodeDetailedStreams (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  sps_date DATE NOT NULL,
  sps_starts INTEGER NOT NULL,
  sps_streams INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, sps_date)
);


CREATE TABLE IF NOT EXISTS spotifyPodcastListeners (
  account_id INTEGER NOT NULL,
  spl_date DATE NOT NULL,
  spl_count INTEGER NOT NULL,
  PRIMARY KEY (account_id, spl_date)
);

CREATE TABLE IF NOT EXISTS spotifyPodcastFollowers (
  account_id INTEGER NOT NULL,
  spf_date DATE NOT NULL,
  spf_count INTEGER NOT NULL,
  PRIMARY KEY (account_id, spf_date)
);

CREATE TABLE IF NOT EXISTS spotifyEpisodeListeners (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  spl_date DATE NOT NULL,
  spl_count INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, spl_date)
);

CREATE TABLE IF NOT EXISTS spotifyEpisodeAggregate (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  spa_date DATE NOT NULL,
  spa_facet CHAR(8) NOT NULL,
  spa_facet_type ENUM ('age','age_sum','country') NOT NULL, 
  spa_gender_not_specified INTEGER NOT NULL,
  spa_gender_female INTEGER NOT NULL,
  spa_gender_male INTEGER NOT NULL,
  spa_gender_non_binary INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, spa_date, spa_facet_type, spa_facet)
);

CREATE TABLE IF NOT EXISTS spotifyPodcastAggregate (
  account_id INTEGER NOT NULL,
  spa_date DATE NOT NULL,
  spa_facet CHAR(8) NOT NULL,
  spa_facet_type ENUM ('age','age_sum','country') NOT NULL, 
  spa_gender_not_specified INTEGER NOT NULL,
  spa_gender_female INTEGER NOT NULL,
  spa_gender_male INTEGER NOT NULL,
  spa_gender_non_binary INTEGER NOT NULL,
  PRIMARY KEY (account_id, spa_date, spa_facet_type, spa_facet)
);

CREATE TABLE IF NOT EXISTS spotifyEpisodePerformance (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  -- CURRENT_DATE not supported in MySQL < 8 and planetscale
  spp_date DATE NOT NULL DEFAULT CURRENT_DATE,
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
  PRIMARY KEY (account_id, episode_id, spp_date)
);

CREATE TABLE IF NOT EXISTS spotifyPodcastMetadata (
  account_id INTEGER NOT NULL,
  spm_date DATE NOT NULL,
  spm_total_episodes INTEGER NOT NULL,
  spm_starts INTEGER NOT NULL,
  spm_streams INTEGER NOT NULL,
  spm_listeners INTEGER NOT NULL,
  spm_followers INTEGER NOT NULL,
  PRIMARY KEY (account_id, spm_date)
);

CREATE TABLE IF NOT EXISTS spotifyEpisodeMetadata (
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

CREATE TABLE IF NOT EXISTS spotifyEpisodeMetadataHistory (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  epm_date DATE NOT NULL,
  epm_starts INTEGER NOT NULL,
  epm_streams INTEGER NOT NULL,
  epm_listeners INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, epm_date)
);

CREATE TABLE IF NOT EXISTS appleEpisodeMetadata (
  account_id INTEGER NOT NULL,
  episode_id BIGINT NOT NULL,
  ep_name VARCHAR(2048) NOT NULL,
  ep_collection_name VARCHAR(255) NOT NULL,
  ep_release_datetime DATETIME NOT NULL,
  ep_release_date DATE NOT NULL,
  ep_guid VARCHAR(64) NOT NULL,
  ep_number INTEGER,
  ep_type VARCHAR(255) NOT NULL,
  PRIMARY KEY (account_id, episode_id)
);

CREATE TABLE IF NOT EXISTS appleEpisodeDetails (
  account_id INTEGER NOT NULL,
  episode_id BIGINT NOT NULL,
  -- CURRENT_DATE not supported in MySQL < 8 and planetscale
  aed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  aed_playscount INTEGER NOT NULL,
  aed_totaltimelistened BIGINT NOT NULL,
  aed_uniqueengagedlistenerscount INTEGER NOT NULL,
  aed_uniquelistenerscount INTEGER NOT NULL,
  aed_engagedplayscount INTEGER NOT NULL,
  aed_play_histogram JSON,
  aed_play_top_cities JSON,
  aed_play_top_countries JSON,
  aed_histogram_max_listeners INTEGER,
  aed_quarter1_median_listeners INTEGER,
  aed_quarter2_median_listeners INTEGER,
  aed_quarter3_median_listeners INTEGER,
  aed_quarter4_median_listeners INTEGER,
  PRIMARY KEY (account_id, episode_id,aed_date)
);

-- listeners values per day and per episode coming from the apple trends api
CREATE TABLE IF NOT EXISTS appleTrendsEpisodeListeners (
  account_id INTEGER NOT NULL,
  episode_id BIGINT NOT NULL,
  atl_date DATE NOT NULL,
  atl_playscount INTEGER NOT NULL,
  atl_totaltimelistened BIGINT NOT NULL,
  atl_uniqueengagedlistenerscount INTEGER NOT NULL,
  atl_uniquelistenerscount INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, atl_date)
);

-- listeners values per day and per podcast coming from the apple trends api
CREATE TABLE IF NOT EXISTS appleTrendsPodcastListeners (
  account_id INTEGER NOT NULL,
  atl_date DATE NOT NULL,
  atl_playscount INTEGER NOT NULL,
  atl_totaltimelistened BIGINT NOT NULL,
  atl_uniqueengagedlistenerscount INTEGER NOT NULL,
  atl_uniquelistenerscount INTEGER NOT NULL,
  -- define default values for totaltimelistend for followers and non followers
  -- as they are not set in the same insert query
  atl_totaltimelistened_followers BIGINT NOT NULL DEFAULT '0',
  atl_totaltimelistened_nonfollowers BIGINT NOT NULL DEFAULT '0',
  PRIMARY KEY (account_id, atl_date)
);

-- followers, gained/lost values per day
CREATE TABLE IF NOT EXISTS appleTrendsPodcastFollowers (
  account_id INTEGER NOT NULL,
  atf_date DATE NOT NULL,
  atf_totalfollowers INTEGER NOT NULL,
  atf_gained INTEGER NOT NULL,
  atf_lost INTEGER NOT NULL,
  PRIMARY KEY (account_id, atf_date)
);

-- store upvote/downvote (thumbs up/down) per episode 
-- and identify user with ip and agent hash
CREATE TABLE IF NOT EXISTS feedbackVote (
  account_id INTEGER NOT NULL,
  episode_id BIGINT NOT NULL,
  user_hash VARCHAR(64) NOT NULL,
  vote TINYINT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id, episode_id, user_hash)
);

-- store comments per episode
-- and identify user with ip and agent hash
CREATE TABLE IF NOT EXISTS feedbackComment (
  account_id INTEGER NOT NULL,
  episode_id BIGINT NOT NULL,
  user_hash VARCHAR(64) NOT NULL,
  comment TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id, episode_id, created)
);

-- store latest update events
-- current timestamp is used to identify the update
-- contains JSON with the update data
CREATE TABLE IF NOT EXISTS updates (
  account_id INTEGER NOT NULL,
  endpoint VARCHAR(64) NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_data JSON NOT NULL,
  PRIMARY KEY (created, account_id, endpoint)
);

-- automatically delete all updates older than 7 days
CREATE EVENT IF NOT EXISTS updates_cleanup
ON SCHEDULE EVERY 1 DAY
DO DELETE FROM updates WHERE created < DATE_SUB(NOW(), INTERVAL 7 DAY);
