INSERT INTO migrations (migration_id, migration_name) VALUES (12, 'apple aggregated data');

-- aggreagated values per episode coming from the apple trends api
CREATE TABLE IF NOT EXISTS appleTrendsEpisodeListenersAggregated (
  account_id INTEGER NOT NULL,
  episode_id BIGINT NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  atl_playscount INTEGER NOT NULL,
  atl_totaltimelistened BIGINT NOT NULL,
  atl_uniqueengagedlistenerscount INTEGER NOT NULL,
  atl_uniquelistenerscount INTEGER NOT NULL,
  updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  PRIMARY KEY (account_id, episode_id, date_start, date_end)
);

-- aggreagated values per podcast coming from the apple trends api
CREATE TABLE IF NOT EXISTS appleTrendsPodcastListenersAggregated (
  account_id INTEGER NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  atl_playscount INTEGER NOT NULL,
  atl_totaltimelistened BIGINT NOT NULL,
  atl_uniqueengagedlistenerscount INTEGER NOT NULL,
  atl_uniquelistenerscount INTEGER NOT NULL,
  updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  PRIMARY KEY (account_id, date_start, date_end)
);
