CREATE TABLE IF NOT EXISTS anchorPlaysByGeoCity (
  account_id INTEGER NOT NULL,
  date DATE NOT NULL,
  country VARCHAR(128) NOT NULL,
  city VARCHAR(128) NOT NULL,
  plays_percent FLOAT NOT NULL,
  PRIMARY KEY (account_id, date, country, city)
);

INSERT INTO migrations (migration_id, migration_name) VALUES (5, 'anchor geo city');