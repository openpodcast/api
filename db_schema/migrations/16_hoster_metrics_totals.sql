ALTER TABLE hosterPodcastMetrics MODIFY dimension ENUM(
    'downloads',
    'platforms',
    'clients',
    'sources',
    'totals',
    'listeners',
    'subscribers'
) NOT NULL;

INSERT INTO migrations (migration_id, migration_name) VALUES (16, 'podigee totals dimensions');
