-- @doc
-- Returns the plays of the podcast per platform summed up from start to end.
-- days is the number of days with data in the range, to make gaps visible.
-- Fields: podcastId, metric, platform, startDate, endDate, value, days

SELECT
  m.podcast_id AS podcastId,
  mt.name AS metric,
  p.name AS platform,
  DATE_FORMAT(@start, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(@end, '%Y-%m-%d') AS endDate,
  CAST(SUM(m.value) AS UNSIGNED) AS value,
  COUNT(*) AS days
FROM podcastMetrics m
JOIN metrics mt ON mt.metric_id = m.metric_id
JOIN platforms p ON p.platform_id = m.platform_id
WHERE m.podcast_id = @podcast_id
  AND mt.name = 'plays'
  AND m.start_date = m.end_date
  AND m.start_date BETWEEN @start AND @end
GROUP BY m.podcast_id, mt.name, p.name
ORDER BY p.name
