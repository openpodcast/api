-- Returns client distribution for the specified date range

WITH clients_data AS (
    SELECT
        s.dim_name as client_name,
        SUM(h.value) as total_downloads
    FROM hosterPodcastMetrics h
    JOIN subdimensions s ON h.subdimension = s.dim_id
    WHERE h.account_id = @podcast_id
        AND h.dimension = 'clients'
        AND h.start = h.end
        AND h.start BETWEEN @start_date AND @end_date
    GROUP BY s.dim_id, s.dim_name
    HAVING total_downloads > 0
)

SELECT
    client_name,
    total_downloads,
    ROUND(
        (total_downloads * 100.0 / SUM(total_downloads) OVER()),
        2
    ) as percentage
FROM clients_data
ORDER BY total_downloads DESC;