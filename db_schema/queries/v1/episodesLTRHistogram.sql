WITH spotify as (
  SELECT JSON_ARRAYAGG(JSON_OBJECT(sample_id,listeners)) as histogram,episode_id,account_id,spp_date,spp_sample_max FROM 
    spotifyEpisodePerformance CROSS JOIN
    JSON_TABLE(
        spp_samples,
        "$[*]"
        COLUMNS (
          sample_id FOR ORDINALITY,
          listeners INT PATH "$"
        )
    ) samples
  WHERE account_id = @podcast_id AND spp_date = @end
  GROUP BY account_id,episode_id,spp_sample_max,spp_date
)

SELECT
  guid,
  spotify.spp_date as date,
  spp_sample_max as spotify_listeners_max,
  aed_histogram_max_listeners as apple_listeners_max,
  spotify.histogram as spotify_histogram,
  aed_play_histogram as apple_histogram
FROM
  episodeMapping
  JOIN spotify
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