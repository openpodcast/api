-- Get Podigee overview metrics following the same pattern as reportHosterDownloads
-- Returns listeners, subscribers, and downloads for the date range

WITH
-- Get subdimension IDs
listeners_subdimension AS (
    SELECT dim_id FROM subdimensions WHERE dim_name = 'unique' LIMIT 1
),
subscribers_subdimension AS (
    SELECT dim_id FROM subdimensions WHERE dim_name = 'unique' LIMIT 1
),
downloads_subdimension AS (
    SELECT dim_id FROM subdimensions WHERE dim_name = 'downloads' LIMIT 1
),

-- Get latest listeners data within the date range
listeners_data AS (
    SELECT
        start, end, value as unique_listeners
    FROM hosterPodcastMetrics
    WHERE account_id = @podcast_id
        AND dimension = 'listeners'
        AND subdimension = (SELECT dim_id FROM listeners_subdimension)
        AND start >= @start
        AND end <= @end
    ORDER BY end DESC
    LIMIT 1
),

-- Get latest subscribers data within the date range
subscribers_data AS (
    SELECT
        value as unique_subscribers
    FROM hosterPodcastMetrics
    WHERE account_id = @podcast_id
        AND dimension = 'subscribers'
        AND subdimension = (SELECT dim_id FROM subscribers_subdimension)
        AND start >= @start
        AND end <= @end
    ORDER BY end DESC
    LIMIT 1
),

-- Sum downloads for the date range (similar to reportHosterDownloads)
downloads_data AS (
    SELECT
        SUM(value) as total_downloads
    FROM hosterPodcastMetrics
    WHERE account_id = @podcast_id
        AND dimension = 'downloads'
        AND subdimension = (SELECT dim_id FROM downloads_subdimension)
        AND start >= @start
        AND end <= @end
)

SELECT
    COALESCE(listeners.start, @start) as start,
    COALESCE(listeners.end, @end) as end,
    COALESCE(listeners.unique_listeners, 0) as unique_listeners,
    COALESCE(subscribers.unique_subscribers, 0) as unique_subscribers,
    COALESCE(downloads.total_downloads, 0) as total_downloads
FROM
    listeners_data listeners
    LEFT JOIN subscribers_data subscribers ON 1=1
    LEFT JOIN downloads_data downloads ON 1=1