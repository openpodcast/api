-- @doc
-- Returns Spotify impressions broken down by source location (HOME, SEARCH, LIBRARY, OTHER) showing where users discover the podcast.
-- Fields: Account ID, Date Start, Date End, Source ID, Impression Count

SELECT DISTINCT
    account_id,
    FIRST_VALUE(date_start) OVER (PARTITION BY source_id ORDER BY date_end DESC) as date_start,
    FIRST_VALUE(date_end) OVER (PARTITION BY source_id ORDER BY date_end DESC) as date_end,
    source_id,
    FIRST_VALUE(impression_count) OVER (PARTITION BY source_id ORDER BY date_end DESC) as impression_count
FROM
    spotifyImpressionsSources
WHERE
    account_id = @podcast_id 
    AND date_end >= @start 
    AND date_end <= @end 
ORDER BY source_id ASC;