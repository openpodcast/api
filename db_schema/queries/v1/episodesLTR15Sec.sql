WITH spotify as (
  SELECT account_id,episode_id,
  FLOOR(sample_id/15)*15 as sec,
  AVG(listeners/spp_sample_max) as percent FROM
  spotifyEpisodePerformance CROSS JOIN
  JSON_TABLE(
      spp_samples,
      "$[*]"
      COLUMNS (
        sample_id FOR ORDINALITY,
        listeners INT PATH "$")
  ) samples
  WHERE spp_date = @end AND account_id = @podcast_id
  GROUP BY account_id,episode_id, FLOOR(sample_id/15)*15
),
apple as (
  SELECT account_id,
  episode_id,
  CAST(JSON_EXTRACT(JSON_KEYS(val),"$[0]") as UNSIGNED) as sec,
  JSON_EXTRACT(JSON_EXTRACT(val,"$.*"),"$[0]")/aed_histogram_max_listeners as percent
  FROM
    appleEpisodeDetails CROSS JOIN
    JSON_TABLE(
        aed_play_histogram,
        "$[*]"
        COLUMNS (
          val JSON PATH "$"
        )
    ) samples
  WHERE aed_date = @end AND account_id = @podcast_id
)

SELECT
guid,
apple.sec as sec,
spotify.percent as spotify_percent,
apple.percent as apple_percent
FROM spotify
JOIN episodeMapping ON (spotify.episode_id = episodeMapping.spotify_episode_id AND spotify.account_id = episodeMapping.account_id)
JOIN apple ON (apple.episode_id = episodeMapping.apple_episode_id AND apple.account_id = episodeMapping.account_id)
WHERE spotify.sec = apple.sec AND apple.account_id = @podcast_id


  
