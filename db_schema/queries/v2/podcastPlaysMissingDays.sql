-- @doc
-- Returns the days between start and end without daily Spotify plays of the podcast.
-- Can be used to fetch missing days and fill gaps.
-- Fields: podcastId, metric, platform, date

WITH RECURSIVE days (day) AS (
  SELECT CAST(@start AS DATE)
  UNION ALL
  SELECT day + INTERVAL 1 DAY FROM days WHERE day < CAST(@end AS DATE)
)
SELECT /*+ SET_VAR(cte_max_recursion_depth = 100000) */
  @podcast_id AS podcastId,
  'plays' AS metric,
  'spotify' AS platform,
  d.day AS date
FROM days d
WHERE NOT EXISTS (
  SELECT 1
  FROM podcastMetrics m
  JOIN metrics mt ON mt.metric_id = m.metric_id
  JOIN platforms p ON p.platform_id = m.platform_id
  WHERE m.podcast_id = @podcast_id
    AND mt.name = 'plays'
    AND p.name = 'spotify'
    AND m.start_date = d.day
    AND m.end_date = d.day
)
ORDER BY d.day
