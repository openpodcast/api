-- store unfollowers as well in the db to be able to calculate to total followers
ALTER TABLE appleTrendsPodcastFollowers ADD atf_totalunfollowers INTEGER NOT NULL DEFAULT 0 AFTER atf_totalfollowers;

INSERT INTO migrations (migration_id, migration_name) VALUES (8, 'apple followers');