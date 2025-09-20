-- Calculate lifetime downloads per episode for a given podcast (account_id)
-- Lifetime downloads are calculated by summing all monthly download values per episode
-- Monthly data has start = first day of month, end = last day of month
-- +------------+------------+----------+---------------------+-----------+--------------------+
-- | podcast_id | episode_id | ep_name  | ep_release_date     | hoster_id | lifetime_downloads |
-- +------------+------------+----------+---------------------+-----------+--------------------+


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
-- sum all monthly values per episode
-- monthly rows start on the first of a month and the end is the last day of the month
episode_lifetime_downloads AS (
    SELECT
        account_id,
        episode_id,
        hoster_id,
        dimension,
        subdimension,
        SUM(value) AS lifetime_downloads
    FROM
        hosterEpisodeMetrics
    WHERE
        account_id = @podcast_id
        AND dimension = 'downloads'
        AND subdimension = (SELECT dim_id FROM download_subdimensions)
        -- monthly rows start on the first of a month and the end is the last day of the month
        AND DAYOFMONTH(start) = 1 AND DATE(end) = LAST_DAY(start)
    GROUP BY
        account_id,
        episode_id,
        hoster_id,
        dimension,
        subdimension
)

SELECT
    eld.account_id AS podcast_id,
    eld.episode_id,
    hmd.ep_name,
    hmd.ep_release_date,
    eld.hoster_id,
    eld.lifetime_downloads as lifetime_downloads
FROM
    episode_lifetime_downloads eld
JOIN 
    hosterEpisodeMetadata hmd ON eld.account_id = hmd.account_id 
    AND eld.episode_id = hmd.episode_id
ORDER BY
    eld.lifetime_downloads DESC;