-- The percentage of plays by geo is a float, not an integer.
ALTER TABLE anchorPlaysByGeo ALTER COLUMN plays_percent TYPE FLOAT;