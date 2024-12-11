-- Store OAuth tokens and related data
CREATE TABLE IF NOT EXISTS podigeeOAuthTokens (
    account_id INTEGER NOT NULL,
    podigee_user_id VARCHAR(128) NOT NULL,
    podigee_podcast_id VARCHAR(128) NOT NULL,
    access_token VARCHAR(512) NOT NULL,
    refresh_token VARCHAR(512) NOT NULL,
    token_type VARCHAR(64) NOT NULL,
    scope VARCHAR(512),
    expires_at TIMESTAMP NOT NULL,
    -- Helpful for troubleshooting
    raw_token_response JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (account_id, podigee_user_id, podigee_podcast_id)
);


INSERT INTO migrations (migration_id, migration_name) VALUES (12, 'podigee oauth');