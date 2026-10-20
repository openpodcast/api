-- @doc
-- Returns the lifetime plays of the podcast per platform as reported by the platform.
-- The range starts at the release date and ends at the date the data was fetched.
-- The latest value fetched on or before end is returned (start is ignored).
-- Fields: podcastId, metric, platform, startDate, endDate, value

SELECT podcastId, metric, platform, startDate, endDate, value
FROM (
  SELECT
    m.podcast_id AS podcastId,
    mt.name AS metric,
    p.name AS platform,
    m.start_date AS startDate,
    m.end_date AS endDate,
    m.value,
    ROW_NUMBER() OVER (PARTITION BY m.platform_id ORDER BY m.end_date DESC, m.start_date) AS rn
  FROM podcastMetrics m
  JOIN metrics mt ON mt.metric_id = m.metric_id
  JOIN platforms p ON p.platform_id = m.platform_id
  WHERE m.podcast_id = @podcast_id
    AND mt.name = 'plays'
    AND m.start_date < m.end_date
    AND m.end_date <= @end
) lifetime
WHERE rn = 1
ORDER BY platform
