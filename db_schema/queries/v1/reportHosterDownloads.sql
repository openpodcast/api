-- get subdimension id for downloads
WITH download_subdimensions AS (
    SELECT
        dim_id, dim_name
    FROM
        subdimensions
    WHERE
        dim_name = 'complete'
    LIMIT 1
)

SELECT
    account_id AS podcast_id,
    hoster_id,
    dimension,
    subdimension,
    start,
    value, -- daily value
    -- total sum over daterange
    SUM(value) OVER (
        PARTITION BY account_id, hoster_id, dimension, subdimension
        ORDER BY start
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS value_total
FROM
    hosterPodcastMetrics
WHERE
    account_id = @podcast_id
    AND dimension = 'downloads'
    AND subdimension = (SELECT dim_id FROM download_subdimensions)
    AND start = end
    AND start BETWEEN @start AND @end;
