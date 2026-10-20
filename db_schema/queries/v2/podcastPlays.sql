-- @doc
-- Returns daily plays of the podcast per platform (Spotify: streams of 60+ seconds).
-- Each row is a daily value (startDate = endDate) between start and end.
-- Fields: podcastId, metric, platform, startDate, endDate, value

SELECT
  m.podcast_id AS podcastId,
  mt.name AS metric,
  p.name AS platform,
  m.start_date AS startDate,
  m.end_date AS endDate,
  m.value
FROM podcastMetrics m
JOIN metrics mt ON mt.metric_id = m.metric_id
JOIN platforms p ON p.platform_id = m.platform_id
WHERE m.podcast_id = @podcast_id
  AND mt.name = 'plays'
  AND m.start_date = m.end_date
  AND m.start_date BETWEEN @start AND @end
ORDER BY m.start_date, p.name
