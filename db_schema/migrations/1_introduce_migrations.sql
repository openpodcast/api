-- First migration that creates the meta table to track migrations

CREATE TABLE IF NOT EXISTS migrations (
  migration_id INTEGER NOT NULL,
  migration_name VARCHAR(64) NOT NULL,
  migration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (migration_id)
);

INSERT INTO migrations (migration_id, migration_name) VALUES (1, 'init migrations table');