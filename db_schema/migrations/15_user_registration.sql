-- Migration: Add user registration tables
-- Migration ID: 15

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Note: Foreign key constraint between apiKeys.account_id and users.id
-- cannot be implemented due to cross-database limitations (apiKeys is in openpodcast_auth database)
-- The relationship is maintained programmatically in the application code

-- Update migrations table
INSERT INTO migrations (migration_id, migration_name) VALUES (15, 'user_registration');