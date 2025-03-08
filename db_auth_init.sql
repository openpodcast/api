-- is calles while initalizing the database
-- as has to be run as root user to set the permissions


CREATE DATABASE IF NOT EXISTS openpodcast_auth;
GRANT ALL PRIVILEGES ON openpodcast_auth.* TO 'openpodcast'@'%';

-- run make init_auth_db after API is running to initialize the schema of the auth db