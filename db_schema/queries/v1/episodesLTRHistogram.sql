SELECT
  guid,
  spotify.spp_date as date,
  spp_sample_max as spotify_listeners_max,
  aed_histogram_max_listeners as apple_listeners_max,
  spotify.histogram as spotify_histogram,
  aed_play_histogram as apple_histogram
FROM
  episodeMapping
  JOIN spotifyEpisodePerformance15SecBuckets as spotify
  JOIN appleEpisodeDetails as apple
WHERE
  -- main join criteria
  spotify.episode_id = episodeMapping.spotify_episode_id
  AND apple.episode_id = episodeMapping.apple_episode_id
  -- account id
  AND episodeMapping.account_id = @podcast_id
  AND spotify.account_id = @podcast_id
  AND apple.account_id = @podcast_id
  -- date criteria
  AND spotify.spp_date = @end
  AND apple.aed_date = @end