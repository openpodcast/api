# OpenPodcast API

[![Docker Pulls](https://img.shields.io/docker/pulls/openpodcast/api?color=%23099cec&logo=Docker)](https://hub.docker.com/r/openpodcast/api)

![OpenPodcast Banner](https://raw.githubusercontent.com/openpodcast/banner/main/openpodcast-banner.png)

This thin API layer is used to store `POST`ed payloads to the main storage
system of Open Podcast.

## Getting Started

-   Run `make install-init`
-   Start dev server with `make dev`
-   Create `.env` file based on `env.example` and change the credentials to access the database. For a docker compose setup have a look at [https://github.com/openpodcast/stack](https://github.com/openpodcast/stack)
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

### Status API

The status API returns the last imports by endpoint:

```json
{
    "account_id": 1,
    "latestUpdates": [
        "aggregate": "2021-01-01 00:00:00"
        "detailedStreams": "2021-01-01 00:00:00"
    ]
}
```

To query it, use the following endpoint: `/status`

### Tools to create (JSON) schemata

-   <https://transform.tools/json-to-json-schema>
