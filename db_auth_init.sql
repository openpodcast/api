-- this permission script is for the auth db and used for local development
-- auth is not handled by the migrations of api as the openpodcast_auth db is separate
-- and should be managed separately by a root user
-- the api should only have read access to the auth db and write access to the main db
-- therfore, this script should be run by a root user after the api has created the schema using the migrations

CREATE DATABASE IF NOT EXISTS openpodcast_auth;
GRANT ALL PRIVILEGES ON openpodcast_auth.* TO 'openpodcast'@'%';

-- the auth schema itself is created by `make db-init-auth`
-- and should be run by a root user after the api has created the schema using the migrations