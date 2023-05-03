WITH spotify as (
  SELECT account_id,episode_id,
  -- calc sec bucket in 15 sec buckets
  FLOOR(sample_id/15)*15 as sec,
  -- calc avg listeners per bucket
  AVG(listeners/spp_sample_max) as percent FROM
  spotifyEpisodePerformance CROSS JOIN
  JSON_TABLE(
      spp_samples,
      "$[*]"
      COLUMNS (
        sample_id FOR ORDINALITY,
        listeners INT PATH "$"
      )
  ) samples
  WHERE spp_date = @end AND account_id = @podcast_id
  GROUP BY account_id,episode_id, FLOOR(sample_id/15)*15
),
apple as (
  SELECT account_id,
  episode_id,
  -- extract from json data row like {"0": 5}
  -- apple is already in 15 sec buckets
  CAST(JSON_EXTRACT(JSON_KEYS(val),"$[0]") as UNSIGNED) as sec,
  -- extract value from json data row like {"0": 5} and divide by max listeners
  JSON_EXTRACT(JSON_EXTRACT(val,"$.*"),"$[0]")/aed_histogram_max_listeners as percent
  FROM
    appleEpisodeDetails CROSS JOIN
    -- extract the elements in form of {"0": 5} per row
    JSON_TABLE(
        aed_play_histogram,
        "$[*]"
        COLUMNS (
          val JSON PATH "$"
        )
    ) samples
  WHERE aed_date = @end AND account_id = @podcast_id
),
episodeMappingFiltered as (
  SELECT * from episodeMapping WHERE account_id = @podcast_id
)

SELECT
  -- do not merge CTEs but materialize them first
  /*+ NO_MERGE(episodeMapping) NO_MERGE(spotify) NO_MERGE(apple) */
  guid,
  apple.sec as sec,
  spotify.percent as spotify_percent,
  apple.percent as apple_percent
FROM
  episodeMappingFiltered as episodeMapping
  JOIN spotify
  JOIN apple
WHERE
  spotify.episode_id = episodeMapping.spotify_episode_id
  AND apple.episode_id = episodeMapping.apple_episode_id AND spotify.sec = apple.sec;