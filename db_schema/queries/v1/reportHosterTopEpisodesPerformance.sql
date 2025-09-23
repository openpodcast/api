-- Top episodes performance based on hoster data only
-- Uses daily data (start = end) after episode release date
-- Aggregates downloads from hoster episode metrics

WITH download_subdimensions AS (
    SELECT
        dim_id
    FROM
        subdimensions
    WHERE
        dim_name = 'complete'
    LIMIT 1
),
hoster_episode_performance AS (
    SELECT
        hem.account_id,
        hem.episode_id,
        hmd.ep_name,
        hmd.ep_release_date,
        hem.value as downloads,
        DATEDIFF(hem.start, hmd.ep_release_date) AS day_since_release
    FROM
        hosterEpisodeMetrics hem
    JOIN
        hosterEpisodeMetadata hmd ON hem.episode_id = hmd.episode_id 
        AND hem.account_id = hmd.account_id
    WHERE
        hem.account_id = @podcast_id
        AND hem.dimension = 'downloads'
        AND hem.subdimension = (SELECT dim_id FROM download_subdimensions)
        AND hem.start = hem.end -- daily data only
        AND hem.start >= hmd.ep_release_date -- only data after release
),
average_downloads AS (
    -- Calculate the average downloads per day since release
    SELECT 
        account_id,
        day_since_release,
        FLOOR(AVG(downloads)) AS avg_downloads
    FROM hoster_episode_performance
    WHERE account_id = @podcast_id
    GROUP BY account_id, day_since_release
),
ranked_episodes AS (
    -- Rank episodes by total downloads per account
    SELECT 
        account_id,
        episode_id,
        SUM(downloads) AS total_downloads,
        RANK() OVER (PARTITION BY account_id ORDER BY SUM(downloads) DESC) AS ep_rank
    FROM hoster_episode_performance
    WHERE account_id = @podcast_id
    GROUP BY account_id, episode_id
),
top_episodes AS (
    -- Filter to top 10 episodes per account
    SELECT *
    FROM ranked_episodes
    WHERE ep_rank <= 10
)
SELECT 
    dl.account_id,
    ed.ep_name,
    dl.episode_id,
    dl.day_since_release,
    dl.downloads as total_downloads,
    ad.avg_downloads
FROM hoster_episode_performance dl
JOIN top_episodes te 
    ON dl.account_id = te.account_id
    AND dl.episode_id = te.episode_id
JOIN average_downloads ad 
    ON dl.account_id = ad.account_id
    AND dl.day_since_release = ad.day_since_release
JOIN hosterEpisodeMetadata ed
    ON dl.account_id = ed.account_id
    AND dl.episode_id = ed.episode_id
WHERE dl.account_id = @podcast_id
