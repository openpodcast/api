-- Gets impressions breakdown by source (HOME, SEARCH, LIBRARY, OTHER)
-- Returns data for the most recent 30-day period within the requested date range

SELECT DISTINCT
    account_id,
    FIRST_VALUE(date_start) OVER (PARTITION BY source_id ORDER BY date_start DESC) as date_start,
    FIRST_VALUE(date_end) OVER (PARTITION BY source_id ORDER BY date_start DESC) as date_end,
    source_id,
    FIRST_VALUE(impression_count) OVER (PARTITION BY source_id ORDER BY date_start DESC) as impression_count
FROM
    spotifyImpressionsSources
WHERE
    account_id = @podcast_id 
    AND date_start >= @start 
    AND date_start <= @end 
ORDER BY source_id ASC;