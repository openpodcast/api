CREATE TABLE IF NOT EXISTS anchorEpisodesPage (
  account_id INTEGER NOT NULL,
  episode_id VARCHAR(128) NOT NULL,
  web_episode_id VARCHAR(128) NOT NULL,
  PRIMARY KEY (account_id, episode_id, web_episode_id)
);

-- Add a secondary index to resolve the web_episode_id to the episode_id
CREATE INDEX idx_account_episode ON anchorEpisodesPage(account_id, web_episode_id, episode_id);

INSERT INTO migrations (migration_id, migration_name) VALUES (11, 'anchor episodesPage');