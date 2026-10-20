-- @doc
-- Returns the plays per episode and platform summed up from start to end.
-- days is the number of days with data in the range, to make gaps visible.
-- Fields: episodeId, metric, platform, startDate, endDate, value, days

SELECT
  m.episode_id AS episodeId,
  mt.name AS metric,
  p.name AS platform,
  DATE_FORMAT(@start, '%Y-%m-%d') AS startDate,
  DATE_FORMAT(@end, '%Y-%m-%d') AS endDate,
  CAST(SUM(m.value) AS UNSIGNED) AS value,
  COUNT(*) AS days
FROM episodes e
JOIN episodeMetrics m ON m.episode_id = e.episode_id
JOIN metrics mt ON mt.metric_id = m.metric_id
JOIN platforms p ON p.platform_id = m.platform_id
WHERE e.podcast_id = @podcast_id
  AND mt.name = 'plays'
  AND m.start_date = m.end_date
  AND m.start_date BETWEEN @start AND @end
GROUP BY m.episode_id, mt.name, p.name
ORDER BY m.episode_id, p.name
