-- Create table for storing aggregate impression metrics
CREATE TABLE IF NOT EXISTS anchorImpressions (
    account_id INTEGER NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    total_impressions INTEGER NOT NULL,
    total_considerations INTEGER NOT NULL,
    total_streams INTEGER NOT NULL,
    considerations_conversion_rate DECIMAL(10,5),
    streams_conversion_rate DECIMAL(10,5),
    PRIMARY KEY (account_id, date_start, date_end)
);

-- Create table for daily impression data
CREATE TABLE IF NOT EXISTS anchorImpressionsDaily (
    account_id INTEGER NOT NULL,
    date DATE NOT NULL,
    impressions INTEGER NOT NULL,
    PRIMARY KEY (account_id, date)
);

-- Create table for impression sources breakdown
CREATE TABLE IF NOT EXISTS anchorImpressionsSources (
    account_id INTEGER NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    source_id VARCHAR(32) NOT NULL,
    source_name VARCHAR(64) NOT NULL,
    impression_count INTEGER NOT NULL,
    PRIMARY KEY (account_id, date_start, date_end, source_id)
);

-- Add index for querying date ranges efficiently on sources table
CREATE INDEX idx_impression_sources_date ON anchorImpressionsSources(account_id, date_start, date_end);

-- Record the migration
INSERT INTO migrations (migration_id, migration_name) VALUES (15, 'anchor impressions');
