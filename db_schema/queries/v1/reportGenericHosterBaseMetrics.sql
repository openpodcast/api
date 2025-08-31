-- Returns both total metrics and metrics for a given period (e.g., last 30 days)
-- Only sums daily metrics (start = end)
-- Covers downloads, platforms, clients, sources

SELECT
    account_id AS podcast_id,
    hoster_id,
    dimension,
    subdimension,
    SUM(CASE 
            WHEN start >= @start_date AND start < @end_date AND start = end
            THEN value 
            ELSE 0 
        END) AS value_period,
    SUM(CASE 
            WHEN start = end
            THEN value 
            ELSE 0 
        END) AS value_total
FROM
    hosterPodcastMetrics
WHERE
    account_id = @podcast_id
    AND dimension = 'downloads'
GROUP BY
    account_id,
    hoster_id,
    dimension,
    subdimension
ORDER BY
    hoster_id,
    dimension;
