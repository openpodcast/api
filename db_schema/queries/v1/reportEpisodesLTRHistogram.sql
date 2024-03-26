WITH
maxSpotifyDate as (SELECT MAX(spp_date) as d FROM spotifyEpisodePerformance WHERE account_id = @podcast_id AND spp_date <= @end) 
,maxAppleDate as (SELECT MAX(aed_date) as d FROM appleEpisodeDetails WHERE account_id = @podcast_id AND aed_date <= @end)
,maxSpotifyMetadataDate as (SELECT MAX(epm_date) as d FROM spotifyEpisodeMetadataHistory WHERE account_id = @podcast_id AND epm_date <= @end)

SELECT
  guid,
  meta.ep_name,
  spotify.spp_date as date,
  ep_release_date,
  spp_sample_max as spotify_listeners_max,
  aed_histogram_max_listeners as apple_listeners_max,
  spotify.histogram as spotify_histogram,
  aed_play_histogram as apple_histogram,
  metaHistory.epm_listeners as spotify_total_listeners
FROM
  episodeMapping
  JOIN spotifyEpisodePerformance15SecBuckets as spotify
  JOIN appleEpisodeDetails as apple
  JOIN spotifyEpisodeMetadata as meta
  JOIN spotifyEpisodeMetadataHistory as metaHistory
WHERE
  -- main join criteria
  spotify.episode_id = episodeMapping.spotify_episode_id
  AND apple.episode_id = episodeMapping.apple_episode_id
  AND meta.episode_id = episodeMapping.spotify_episode_id
  AND metaHistory.episode_id = episodeMapping.spotify_episode_id
  -- account id
  AND episodeMapping.account_id = @podcast_id
  AND spotify.account_id = @podcast_id
  AND apple.account_id = @podcast_id
  AND metaHistory.account_id = @podcast_id
  -- date criteria
  AND spotify.spp_date = (SELECT d FROM maxSpotifyDate)
  AND apple.aed_date = (SELECT d FROM maxAppleDate)
  AND metaHistory.epm_date = (SELECT d FROM maxSpotifyMetadataDate)
  -- in the report we would not have data for episodes 
  -- that weren't released yet
  AND ep_release_date <= @end
ORDER BY
  ep_release_date DESC