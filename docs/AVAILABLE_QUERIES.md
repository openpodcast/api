# Available Analytics Query Endpoints

This document lists all available query endpoints in the Open Podcast Analytics API.

All endpoints follow the pattern: `/analytics/v1/{podcast_id}/{query_name}`

Query parameters:
- `start`: Start date (YYYY-MM-DD format)
- `end`: End date (YYYY-MM-DD format)

Add `/csv` to the end of any endpoint to get CSV format instead of JSON.

## Spotify Endpoints

### Podcast-Level Metrics
- `reportSpotifyPodcastBaseMetrics` - Base podcast metrics (streams, listeners, followers)
- `reportSpotifyPlays` - Play counts over time
- `reportSpotifyUniqueListeners` - Unique listener counts
- `spotifyPlaysSum` - Sum of plays for a date range

### Episode-Level Metrics
- `spotifyEpisodesMetricsExport` - Detailed episode metrics export

### Demographics
- `podcastAge` - Age distribution of podcast listeners
- `podcastGender` - Gender distribution of podcast listeners
- `episodesAge` - Age distribution per episode
- `episodesGender` - Gender distribution per episode

### Geographic Data
- `spotifyCountries` - Geographic distribution by country

### Impressions & Discovery
- `spotifyImpressions` - Total impressions over time
- `spotifyImpressionsSources` - Impressions by source (HOME, SEARCH, LIBRARY, OTHER)
- `spotifyImpressionsFunnel` - Conversion funnel from impressions to streams

## Apple Podcasts Endpoints

### Podcast-Level Metrics
- `reportApplePodcastBaseMetrics` - Base podcast metrics (plays, listeners, engagement)
- `applePodcastFollowers` - Follower counts and trends
- `reportApplePlays` - Play counts over time

### Episode-Level Metrics
- `appleEpisodesPlays` - Episode play counts
- `appleEpisodesLTR` - Episode listen-through rates
- `reportEpisodesLTRHistogram` - Detailed LTR histograms per episode

### Geographic Data
- `rawApplePodcastCountries` - Geographic distribution by country

## Cross-Platform Endpoints

### Episode Metrics
- `episodesTotalMetrics` - Combined Apple + Spotify total metrics per episode
- `episodesDailyMetrics` - Combined daily metrics per episode
- `episodesMetadata` - Episode metadata from all platforms
- `episodesLTR` - Combined listen-through rates
- `episodesLTRHistogram` - Combined LTR histograms

### Podcast Metrics
- `podcastMetadata` - Podcast metadata from all platforms
- `podcastFollowers` - Combined follower counts

## Generic Hoster Endpoints

### Downloads & Performance
- `reportHosterDownloads` - Download counts over time
- `reportTopEpisodesPerformance` - Top performing episodes
- `reportEpisodeTotalPlays` - Total plays per episode (lifetime)

### Distribution Metrics
- `reportHosterPlatforms` - Platform/app distribution (e.g., Apple Podcasts, Spotify, Overcast)
- `reportHosterClients` - Client/device distribution

### Podigee-Specific
- `reportHosterPodigeePodcastOverview` - Podcast overview metrics (Podigee hosting)

## Chart Rankings

- `chartsRankings` - Chart positions and rankings across platforms

## Anchor (Legacy)

### Episode Metrics
- `reportAnchorEpisodeMetadata` - Episode metadata
- `reportAnchorEpisodeLTRHistogram` - Episode listen-through histogram
- `reportAnchorAvgEpisodeLTRHistogram` - Average LTR across episodes

### Audience
- `reportAnchorTotalPlaysByEpisode` - Total plays per episode
- `reportAnchorPlays` - Plays over time
- `reportAnchorTopEpisodes` - Top performing episodes

## Utility Endpoints

- `ping` - Health check / connection test

## Example Usage

### Get Spotify podcast metrics for August 2024 (JSON)
```bash
GET /analytics/v1/123/reportSpotifyPodcastBaseMetrics?start=2024-08-01&end=2024-08-31
Authorization: Bearer YOUR_TOKEN
```

### Get platform distribution for August 2024 (CSV)
```bash
GET /analytics/v1/123/reportHosterPlatforms/csv?start=2024-08-01&end=2024-08-31
Authorization: Bearer YOUR_TOKEN
```

### Get combined episode metrics (defaults to yesterday if no dates provided)
```bash
GET /analytics/v1/123/episodesTotalMetrics
Authorization: Bearer YOUR_TOKEN
```

## Response Format

### JSON Response
```json
{
  "meta": {
    "query": "reportSpotifyPodcastBaseMetrics",
    "podcastId": "123",
    "date": "2024-09-24T12:00:00Z",
    "startDate": "2024-08-01",
    "endDate": "2024-08-31"
  },
  "data": [
    {
      "total_episodes": 50,
      "starts": 10000,
      "streams": 8500,
      "listeners": 5000,
      "followers": 2500,
      "date": "2024-08-31"
    }
  ]
}
```

### CSV Response
When requesting CSV format (by adding `/csv` to the endpoint), the response will be a CSV file with appropriate headers.

## Notes

- All endpoints require authentication via Bearer token
- Users can only access podcast IDs they have permission for
- Date parameters are optional - defaults to yesterday if not provided
- Invalid date formats or date ranges will return 400 Bad Request
- Non-existent query endpoints will return 404 Not Found
