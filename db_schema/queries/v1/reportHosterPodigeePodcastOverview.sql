-- Podigee podcast overview metrics for the date range
-- Returns unique listeners, subscribers, and total downloads for the report period

WITH
-- Get listeners and subscribers subdimensions
listeners_subdimension AS (
    SELECT dim_id FROM subdimensions WHERE dim_name = 'listeners' LIMIT 1
),
subscribers_subdimension AS (
    SELECT dim_id FROM subdimensions WHERE dim_name = 'subscribers' LIMIT 1
),
downloads_subdimension AS (
    SELECT dim_id FROM subdimensions WHERE dim_name = 'complete' LIMIT 1
),

-- Get listeners metrics for the date range
listeners_data AS (
    SELECT
        SUM(value) as unique_listeners
    FROM hosterPodcastMetrics
    WHERE account_id = @podcast_id
        AND dimension = 'listeners'
        AND subdimension = (SELECT dim_id FROM listeners_subdimension)
        AND start >= @start
        AND end <= @end
),

-- Get subscribers metrics for the date range
subscribers_data AS (
    SELECT
        SUM(value) as unique_subscribers
    FROM hosterPodcastMetrics
    WHERE account_id = @podcast_id
        AND dimension = 'subscribers'
        AND subdimension = (SELECT dim_id FROM subscribers_subdimension)
        AND start >= @start
        AND end <= @end
),

-- Get downloads for the date range
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
    @start as start,
    @end as end,
    COALESCE(listeners.unique_listeners, 0) as unique_listeners,
    COALESCE(subscribers.unique_subscribers, 0) as unique_subscribers,
    COALESCE(downloads.total_downloads, 0) as total_downloads
FROM
    (SELECT 1) base
    LEFT JOIN listeners_data listeners ON 1=1
    LEFT JOIN subscribers_data subscribers ON 1=1
    LEFT JOIN downloads_data downloads ON 1=1