-- as old data is not stored per episode,
-- we can just delete all rows, they are useless
DROP TABLE IF EXISTS anchorAggregatedPerformance;

-- and recreate the table with an episode_id column
CREATE TABLE IF NOT EXISTS anchorAggregatedPerformance (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  date DATE NOT NULL,
  percentile25 INTEGER NOT NULL,
  percentile50 INTEGER NOT NULL,
  percentile75 INTEGER NOT NULL,
  percentile100 INTEGER NOT NULL,
  average_listen_seconds INTEGER NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);

INSERT INTO migrations (migration_id, migration_name) VALUES (9, 'anchor episodeid');