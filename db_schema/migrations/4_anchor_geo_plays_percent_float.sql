-- The percentage of plays by geo is a float, not an integer.
ALTER TABLE anchorPlaysByGeo MODIFY COLUMN plays_percent FLOAT;
