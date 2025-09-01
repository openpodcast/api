-- get subdimension id for downloads
WITH download_subdimensions AS (
    SELECT
        dim_id, dim_name
    FROM
        subdimensions
    WHERE
        dim_name = 'complete'
    LIMIT 1
),
-- sum all monthly values
-- monthly rows start on the first of a month and the end is the last day of the month
total_downloads AS (
    SELECT
        account_id AS podcast_id,
        hoster_id,
        dimension,
        subdimension,
        SUM(value) AS lifetime_downloads
    FROM
        hosterPodcastMetrics
    WHERE
        account_id = @podcast_id
        AND dimension = 'downloads'
        AND subdimension = (SELECT dim_id FROM download_subdimensions)
        AND DAYOFMONTH(start) = 1
        AND YEAR(start) = YEAR(end)
        AND MONTH(start) = MONTH(end)
        AND DAYOFMONTH(end) = LAST_DAY(end)
    GROUP BY
        account_id,
        hoster_id,
        dimension,
        subdimension
)

SELECT
    account_id AS podcast_id,
    hoster_id,
    dimension,
    subdimension,
    start,
    value as daily_downloads, -- daily value
    -- total sum over daterange
    SUM(value) OVER (
        PARTITION BY account_id, hoster_id, dimension, subdimension
        ORDER BY start
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS total_downloads,
    (SELECT lifetime_downloads FROM total_downloads LIMIT 1) AS lifetime_downloads
FROM
    hosterPodcastMetrics
WHERE
    account_id = @podcast_id
    AND dimension = 'downloads'
    AND subdimension = (SELECT dim_id FROM download_subdimensions)
    AND start = end
    AND start BETWEEN @start AND @end;
