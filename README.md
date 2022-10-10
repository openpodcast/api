# OpenPodcast API

This thin API layer is used to store `POST`ed payload to the main storage system of Open Podcast.

## Getting Started

- `npm install`
- Start dev server with `make dev`.
- Create `.env` file based on `env.example` and change the credentials to access the database.
- In a new window, run e.g. `make send-api-req-local` to send a test request to the local dev server (result is stored to DB).

### Connector Format

```javascript
{
    "provider": "Spotify",
    "version": 1,
    "retrieved": "<timestamp ISO 8601>", //2022-07-21T09:35:31.820Z
    "meta": {
        "show": "<spotify_show_id>",
        "episode": null || "<episode_id>",
        "range": {
            "start": "<date>", //2022-01-01
            "end": "<date>"
        },
        "endpoint": "<endpoint_name>", // e.g. aggregate
    },
    "data": <raw_json>
}
```
