-- The percentage of plays a float, not an integer.
ALTER TABLE anchorPlaysByGeo MODIFY COLUMN plays_percent FLOAT;
ALTER TABLE anchorPlaysByAgeRange MODIFY COLUMN plays_percent FLOAT;
ALTER TABLE anchorPlaysByApp MODIFY COLUMN plays_percent FLOAT;
ALTER TABLE anchorPlaysByDevice MODIFY COLUMN plays_percent FLOAT;
ALTER TABLE anchorPlaysByGender MODIFY COLUMN plays_percent FLOAT;

INSERT INTO migrations (migration_id, migration_name) VALUES (4, 'anchor percent float data type');
