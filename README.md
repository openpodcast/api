# OpenPodcast API

This thin API layer is used to store `POST`ed payload to the main storage system of Open Podcast.

## Getting Started

- `npm install`
- Start dev server with `make dev`.
- Create `.env` file based on `env.example` and change the credentials to access the database.
- In a new window, run e.g. `make send-api-req-local` to send a test request to the local dev server (result is stored to DB).
