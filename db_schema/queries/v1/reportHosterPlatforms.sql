-- Returns platform distribution for the specified date range

WITH platforms_data AS (
    SELECT
        s.dim_name as platform_name,
        SUM(h.value) as total_downloads
    FROM hosterPodcastMetrics h
    JOIN subdimensions s ON h.subdimension = s.dim_id
    WHERE h.account_id = @podcast_id
        AND h.dimension = 'platforms'
        AND h.start = h.end
        AND h.start >= @start_date
        AND h.end <= @end_date
    GROUP BY s.dim_name
    HAVING total_downloads > 0
)

SELECT
    platform_name,
    total_downloads,
    ROUND(
        (total_downloads * 100.0 / SUM(total_downloads) OVER()),
        2
    ) as percentage
FROM platforms_data
ORDER BY total_downloads DESC;