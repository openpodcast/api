-- expose podcast overview metrics as Pdogee provides it
-- +------------+------------+------------------+--------------------+-----------------+
-- | start      | end        | unique_listeners | unique_subscribers | total_downloads |
-- +------------+------------+------------------+--------------------+-----------------+
-- | 2025-08-01 | 2025-08-31 |            12550 |              12213 |           22521 |
-- +------------+------------+------------------+--------------------+-----------------+

WITH listeners AS (
    SELECT start, end, value FROM hosterPodcastMetrics
    WHERE account_id = @podcast_id
    AND end BETWEEN @start AND @end
    AND dimension = "listeners"
    AND subdimension = (SELECT dim_id FROM subdimensions WHERE dim_name = "unique" LIMIT 1)
    ORDER BY end DESC
    LIMIT 1
)

SELECT
    (SELECT DATE(start) FROM listeners) as start,
    (SELECT DATE(end) FROM listeners) as end,
    (SELECT value FROM listeners) as unique_listeners,
    (SELECT value FROM hosterPodcastMetrics
    WHERE account_id = @podcast_id
    AND start = (SELECT start FROM listeners)
    AND end = (SELECT end FROM listeners)
    AND dimension = "subscribers"
    AND subdimension = (SELECT dim_id FROM subdimensions WHERE dim_name = "unique" LIMIT 1)
    LIMIT 1) as unique_subscribers,
    (SELECT value FROM hosterPodcastMetrics
    WHERE account_id = @podcast_id
    AND start = (SELECT start FROM listeners)
    AND end = (SELECT end FROM listeners)
    AND dimension = "downloads"
    AND subdimension = (SELECT dim_id FROM subdimensions WHERE dim_name = "total" LIMIT 1)
    LIMIT 1) as total_downloads