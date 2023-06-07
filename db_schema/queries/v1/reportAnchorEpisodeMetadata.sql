WITH last_date AS (
    SELECT
        MAX(date) as last_date
    FROM
        anchorPodcastEpisodes
    WHERE
        date >= @start
        AND date <= @end
        AND account_id = @podcast_id
)
SELECT
    podcast_id,
    episode_id,
    `date`,
    title,
    description,
    episode_image
FROM
    anchorPodcastEpisodes
WHERE
    date = (SELECT last_date FROM last_date)
    AND is_published = 1
    AND is_deleted = 0
    AND account_id = @podcast_id
ORDER BY
    created DESC