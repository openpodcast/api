-- Values cannot be null as we have existing entries in the table which do not have these values
ALTER TABLE spotifyPodcastMetadata
ADD COLUMN spm_artwork_url VARCHAR(255),
ADD COLUMN spm_release_date DATE,
ADD COLUMN spm_url VARCHAR(255),
ADD COLUMN spm_publisher VARCHAR(255);

INSERT INTO migrations (migration_id, migration_name) VALUES (12, 'spotify podcast metadata');