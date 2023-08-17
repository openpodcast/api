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
    e.web_episode_id as episode_id,
    a.plays
FROM
    anchorTotalPlaysByEpisode AS a
JOIN 
    last_date AS b ON a.date = b.max_date
JOIN 
    anchorEpisodesPage e ON a.account_id = e.account_id AND a.episode_id = e.episode_id
WHERE
    a.account_id = @podcast_id
ORDER BY 
    a.date ASC;
   