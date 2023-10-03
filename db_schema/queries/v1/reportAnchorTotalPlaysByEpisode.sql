SELECT
    a.account_id,
    a.date,
    e.web_episode_id as episode_id,
    a.plays
FROM
    anchorTotalPlaysByEpisode AS a
JOIN 
    anchorEpisodesPage e ON a.account_id = e.account_id AND a.episode_id = e.episode_id
WHERE
    a.account_id = @podcast_id

    AND a.date = (
        SELECT MAX(date) FROM anchorTotalPlaysByEpisode
        WHERE account_id = @podcast_id
        -- as this table stores always the total number of yesterday
        -- we need to increase the end date by one day
        AND date BETWEEN @start AND DATE_ADD(@end, INTERVAL 1 DAY)
    )
ORDER BY 
    a.plays DESC
