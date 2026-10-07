-- Migration 19: Create table for raw Spotify GraphQL data
-- Stores raw JSON payloads from the spotify_graphql pipeline
CREATE TABLE IF NOT EXISTS spotifyGraphQLRaw (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    account_id INTEGER NOT NULL,
    show_uri VARCHAR(255) NOT NULL,
    episode_uri VARCHAR(255) NULL,
    endpoint VARCHAR(100) NOT NULL,
    data JSON NOT NULL,
    retrieved_at DATETIME NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_graphql_raw_account_endpoint (account_id, endpoint),
    INDEX idx_graphql_raw_account_show (account_id, show_uri),
    INDEX idx_graphql_raw_account_episode (account_id, episode_uri)
);

INSERT INTO migrations (migration_id, migration_name) VALUES (19, 'spotify graphql raw');
