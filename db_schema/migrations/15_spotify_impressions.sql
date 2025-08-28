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
        source_id ENUM('HOME', 'SEARCH', 'LIBRARY', 'OTHER') NOT NULL,
    impression_count INTEGER NOT NULL,
    PRIMARY KEY (account_id, date_start, date_end, source_id)
);

-- Record the migration
INSERT INTO migrations (migration_id, migration_name) VALUES (15, 'spotify impressions');