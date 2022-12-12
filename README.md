# OpenPodcast API

[![Docker Pulls](https://img.shields.io/docker/pulls/openpodcast/api?color=%23099cec&logo=Docker)](https://hub.docker.com/r/openpodcast/api)

This thin API layer is used to store `POST`ed payload to the main storage system of Open Podcast.

## Getting Started

-   `npm install`
-   Start dev server with `make dev`.
-   Create `.env` file based on `env.example` and change the credentials to access the database.
-   In a new window, run e.g. `make send-api-req-local` to send a test request to the local dev server (result is stored to DB).

### Connector Format

```javascript
{
    "provider": "spotify",
    "version": 1,
    "retrieved": "<timestamp ISO 8601>", //2022-07-21T09:35:31.820Z
    "meta": {
        "show": "<spotify_show_id>",
        "episode": null || "<episode_id>",
        "endpoint": "<endpoint_name>", // e.g. aggregate
    },
    "range": {
        "start": "<date>", //2022-01-01
        "end": "<date>"
    },
    "data": <raw_json>
}
```

### Feedback API (thumbs up/down)

The feedback API retrieves thumbs up/down votes from listeners.
It stores one unique vote for each episode per IP and user-agent pair.

Endpoint `/feedback/:episodeID/[upvote|downvote]`
e.g. `/feedback/123456/upvote`

### Tools to create (JSON) schemata

-   https://transform.tools/json-to-json-schema
