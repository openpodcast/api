/**
 * OpenAPI schema definitions for common response types
 * These schemas are referenced in the API documentation
 */

export const schemas = {
  /**
   * @openapi
   * components:
   *   schemas:
   *     # Spotify Schemas
   *     SpotifyPodcastMetrics:
   *       type: object
   *       properties:
   *         total_episodes:
   *           type: integer
   *           description: Total number of episodes
   *         starts:
   *           type: integer
   *           description: Number of stream starts
   *         streams:
   *           type: integer
   *           description: Number of completed streams
   *         listeners:
   *           type: integer
   *           description: Unique listener count
   *         followers:
   *           type: integer
   *           description: Total followers
   *         date:
   *           type: string
   *           format: date
   *
   *     SpotifyEpisodePerformance:
   *       type: object
   *       properties:
   *         episode_id:
   *           type: string
   *         episode_name:
   *           type: string
   *         median_percentage:
   *           type: integer
   *           description: Median listen-through percentage
   *         median_seconds:
   *           type: integer
   *           description: Median listen time in seconds
   *         percentile_25:
   *           type: integer
   *         percentile_50:
   *           type: integer
   *         percentile_75:
   *           type: integer
   *         percentile_100:
   *           type: integer
   *
   *     SpotifyDemographics:
   *       type: object
   *       properties:
   *         age_group:
   *           type: string
   *           enum: [0-17, 18-22, 23-27, 28-34, 35-44, 45-59, 60+]
   *         gender:
   *           type: string
   *           enum: [male, female, non-binary, not-specified]
   *         listeners:
   *           type: integer
   *         country:
   *           type: string
   *           description: ISO country code
   *
   *     # Apple Podcasts Schemas
   *     ApplePodcastMetrics:
   *       type: object
   *       properties:
   *         plays:
   *           type: integer
   *           description: Total play count
   *         listeners:
   *           type: integer
   *           description: Unique listener count
   *         engaged_listeners:
   *           type: integer
   *           description: Engaged listener count
   *         total_time_listened:
   *           type: integer
   *           description: Total listening time in seconds
   *         date:
   *           type: string
   *           format: date
   *
   *     AppleEpisodeDetails:
   *       type: object
   *       properties:
   *         episode_id:
   *           type: integer
   *         episode_name:
   *           type: string
   *         plays_count:
   *           type: integer
   *         unique_listeners:
   *           type: integer
   *         unique_engaged_listeners:
   *           type: integer
   *         engaged_plays_count:
   *           type: integer
   *         total_time_listened:
   *           type: integer
   *         quarter1_median:
   *           type: number
   *           description: Median listener retention at 25%
   *         quarter2_median:
   *           type: number
   *           description: Median listener retention at 50%
   *         quarter3_median:
   *           type: number
   *           description: Median listener retention at 75%
   *         quarter4_median:
   *           type: number
   *           description: Median listener retention at 100%
   *
   *     AppleFollowerStats:
   *       type: object
   *       properties:
   *         date:
   *           type: string
   *           format: date
   *         total_followers:
   *           type: integer
   *         gained:
   *           type: integer
   *           description: Followers gained on this day
   *         lost:
   *           type: integer
   *           description: Followers lost on this day
   *
   *     # Episode Mapping Schemas
   *     EpisodeMetadata:
   *       type: object
   *       properties:
   *         account_id:
   *           type: integer
   *         spotify_episode_id:
   *           type: string
   *         apple_episode_id:
   *           type: integer
   *         episode_name:
   *           type: string
   *         guid:
   *           type: string
   *         release_date:
   *           type: string
   *           format: date-time
   *         duration:
   *           type: integer
   *           description: Duration in seconds
   *         artwork_url:
   *           type: string
   *           format: uri
   *
   *     EpisodeTotalMetrics:
   *       type: object
   *       properties:
   *         account_id:
   *           type: integer
   *         spotify_episode_id:
   *           type: string
   *         apple_episode_id:
   *           type: integer
   *         guid:
   *           type: string
   *         date:
   *           type: string
   *           format: date
   *         total_apple_plays:
   *           type: integer
   *         total_apple_listeners:
   *           type: integer
   *         total_apple_engaged_listeners:
   *           type: integer
   *         total_apple_time_listened:
   *           type: integer
   *         total_spotify_starts:
   *           type: integer
   *         total_spotify_streams:
   *           type: integer
   *         total_spotify_listeners:
   *           type: integer
   *
   *     # Hoster Schemas
   *     HosterPlatformDistribution:
   *       type: object
   *       properties:
   *         platform_name:
   *           type: string
   *           description: Platform/app name (e.g., Apple Podcasts, Spotify, Overcast)
   *         total_downloads:
   *           type: integer
   *         percentage:
   *           type: number
   *           format: float
   *           description: Percentage of total downloads
   *
   *     HosterClientDistribution:
   *       type: object
   *       properties:
   *         client_name:
   *           type: string
   *           description: Client/device type
   *         total_downloads:
   *           type: integer
   *         percentage:
   *           type: number
   *           format: float
   *
   *     # Chart Schemas
   *     ChartRanking:
   *       type: object
   *       properties:
   *         date:
   *           type: string
   *           format: date
   *         category:
   *           type: string
   *         country:
   *           type: string
   *         rank:
   *           type: integer
   *         platform:
   *           type: string
   *           enum: [spotify, apple]
   *
   *     # Listen-Through Rate (LTR) Schemas
   *     LTRHistogram:
   *       type: object
   *       properties:
   *         episode_id:
   *           type: string
   *         episode_name:
   *           type: string
   *         seconds:
   *           type: integer
   *           description: Time offset in seconds
   *         apple_listeners:
   *           type: integer
   *         spotify_listeners:
   *           type: integer
   *         apple_percentage:
   *           type: number
   *           description: Percentage of listeners at this point (Apple)
   *         spotify_percentage:
   *           type: number
   *           description: Percentage of listeners at this point (Spotify)
   *
   *     # Impressions Schemas (Spotify)
   *     SpotifyImpressions:
   *       type: object
   *       properties:
   *         date:
   *           type: string
   *           format: date
   *         impressions:
   *           type: integer
   *           description: Total impressions on Spotify
   *
   *     SpotifyImpressionsSources:
   *       type: object
   *       properties:
   *         source:
   *           type: string
   *           enum: [HOME, SEARCH, LIBRARY, OTHER]
   *         impression_count:
   *           type: integer
   *         date_start:
   *           type: string
   *           format: date
   *         date_end:
   *           type: string
   *           format: date
   *
   *     SpotifyFunnel:
   *       type: object
   *       properties:
   *         date:
   *           type: string
   *           format: date
   *         step:
   *           type: string
   *           enum: [impressions, considerations, streams]
   *         count:
   *           type: integer
   *         conversion_percent:
   *           type: number
   *           format: float
   *
   *     # Error Response
   *     Error:
   *       type: object
   *       properties:
   *         message:
   *           type: string
   *         tracingId:
   *           type: string
   *           description: Error tracking ID for debugging
   */
};
