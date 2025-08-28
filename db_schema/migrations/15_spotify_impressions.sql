-- Create table for storing aggregate impression metrics
CREATE TABLE IF NOT EXISTS spotifyImpressions (
    account_id INTEGER NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    total_impressions INTEGER NOT NULL,
    PRIMARY KEY (account_id, date_start, date_end)
);

-- Create table for daily impression data  
CREATE TABLE IF NOT EXISTS spotifyImpressionsDaily (
    account_id INTEGER NOT NULL,
    date DATE NOT NULL,
    impressions INTEGER NOT NULL,
    PRIMARY KEY (account_id, date)
);

-- Create table for impression sources breakdown
CREATE TABLE IF NOT EXISTS spotifyImpressionsSources (
    account_id INTEGER NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    source_id VARCHAR(32) NOT NULL,
    impression_count INTEGER NOT NULL,
    PRIMARY KEY (account_id, date_start, date_end, source_id)
);

-- Create table for impression funnel data
CREATE TABLE IF NOT EXISTS spotifyImpressionsFunnel (
    account_id INTEGER NOT NULL,
    date DATE NOT NULL,
    step_id VARCHAR(32) NOT NULL,
    step_count INTEGER NOT NULL,
    conversion_percent DECIMAL(10,5),
    PRIMARY KEY (account_id, date, step_id)
);

-- Add index for querying date ranges efficiently on sources table
CREATE INDEX idx_spotify_impression_sources_date ON spotifyImpressionsSources(account_id, date_start, date_end);

-- Record the migration
INSERT INTO migrations (migration_id, migration_name) VALUES (15, 'spotify impressions');