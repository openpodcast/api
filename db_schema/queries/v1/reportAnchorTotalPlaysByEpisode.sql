WITH last_date AS (
    SELECT 
        MAX(date) AS max_date
    FROM 
        anchorTotalPlaysByEpisode
    WHERE
        date >= @start
        AND date <= @end
        AND account_id = @podcast_id
)
SELECT
    a.account_id,
    a.date,
    e.episode_id,
    a.plays
FROM
    anchorTotalPlaysByEpisode AS a
JOIN 
    last_date AS b ON a.date = b.max_date
JOIN 
    -- We join on the episode title because to get the episode ID the Anchor API
    -- does not provide episode IDs in the raw episode plays data
    -- TODO: THIS IS WRONG
    -- episode_id contains an int which is the podcast_id in anchorTotalPlaysByEpisode
    anchorPodcastEpisodes AS e ON a.account_id = e.account_id AND a.episode_id = e.title
WHERE
    a.account_id = @podcast_id
ORDER BY 
    a.date ASC;