CREATE TABLE IF NOT EXISTS podigeeEpisodeMetadata (
    account_id INTEGER UNSIGNED NOT NULL,
    episode_id INTEGER UNSIGNED NOT NULL,
    downloads_total INTEGER UNSIGNED NOT NULL,
    cover_image VARCHAR(1024) NOT NULL,
    title VARCHAR(1024) NOT NULL,
    slug VARCHAR(1024) NOT NULL,
    published_at DATETIME NOT NULL
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id, episode_id)
);

CREATE TABLE IF NOT EXISTS podigeePodcastAnalytics (
  account_id INTEGER UNSIGNED NOT NULL,
  date DATE NOT NULL,
  downloads_complete INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS podigeePodcastAnalyticsEpisodes (
  account_id INTEGER UNSIGNED NOT NULL,
  episode_id INTEGER UNSIGNED NOT NULL,
  cover_image VARCHAR(1024) NOT NULL,
  title VARCHAR(1024) NOT NULL,
  slug VARCHAR(1024) NOT NULL,
  published_at DATETIME NOT NULL
  downloads INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);

CREATE TABLE IF NOT EXISTS podigeePodcastAnalyticsPlatforms (
  account_id INTEGER UNSIGNED NOT NULL,
  date DATE NOT NULL,
  platform VARCHAR(255) NOT NULL,
  count INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS podigeePodcastAnalyticsClients (
  account_id INTEGER UNSIGNED NOT NULL,
  date DATE NOT NULL,
  client VARCHAR(255) NOT NULL,
  count INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS podigeePodcastAnalyticsClientsOnPlatforms (
  account_id INTEGER UNSIGNED NOT NULL,
  date DATE NOT NULL,
  platform VARCHAR(255) NOT NULL,
  client VARCHAR(255) NOT NULL,
  count INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS podigeePodcastAnalyticsSources (
  account_id INTEGER UNSIGNED NOT NULL,
  date DATE NOT NULL,
  source VARCHAR(255) NOT NULL,
  count INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS podigeeEpisodeAnalytics (
  account_id INTEGER UNSIGNED NOT NULL,
  episode_id INTEGER UNSIGNED NOT NULL,
  date DATE NOT NULL,
  downloads_complete INTEGER UNSIGNED  NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);

CREATE TABLE IF NOT EXISTS podigeeEpisodeAnalyticsPlatforms (
  account_id INTEGER UNSIGNED NOT NULL,
  episode_id INTEGER UNSIGNED NOT NULL,
  date DATE NOT NULL,
  platform VARCHAR(255) NOT NULL,
  count INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);

CREATE TABLE IF NOT EXISTS podigeeEpisodeAnalyticsClients (
  account_id INTEGER UNSIGNED NOT NULL,
  episode_id INTEGER UNSIGNED NOT NULL,
  date DATE NOT NULL,
  client VARCHAR(255) NOT NULL,
  count INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);

CREATE TABLE IF NOT EXISTS podigeeEpisodeAnalyticsClientsOnPlatforms (
  account_id INTEGER UNSIGNED NOT NULL,
  episode_id INTEGER UNSIGNED NOT NULL,
  date DATE NOT NULL,
  platform VARCHAR(255) NOT NULL,
  client VARCHAR(255) NOT NULL,
  count INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);

CREATE TABLE IF NOT EXISTS podigeeEpisodeAnalyticsSources (
  account_id INTEGER UNSIGNED NOT NULL,
  episode_id INTEGER UNSIGNED NOT NULL,
  date DATE NOT NULL,
  source VARCHAR(255) NOT NULL,
  count INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (account_id, episode_id, date)
);
