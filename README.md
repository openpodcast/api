# OpenPodcast API

This thin api layer is used to store POSTed payload to the main storage system.

## Dev

- start dev server `make dev`
- create `.env` file based on `env.example` and change the credentials to access the database
- run e.g. `make send-api-req-local` to send a test request to the local dev server (result is stored to DB)
