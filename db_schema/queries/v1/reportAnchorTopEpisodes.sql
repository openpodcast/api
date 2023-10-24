SELECT 
    e.episode_id,
    p.title,
    SUM(e.plays) AS total_plays_in_period,
    t.plays AS total_plays
FROM 
    anchorPodcastEpisodes p
    -- Anchor uses two different ids for the same episode, we need to map them for the rest of the query
    JOIN anchorEpisodesPage mapping ON p.account_id = mapping.account_id AND p.episode_id = mapping.web_episode_id
    JOIN anchorTotalPlaysByEpisode t ON p.account_id = t.account_id AND t.episode_id = mapping.episode_id
    -- as we might not have plays for all episodes, we use a left join
    LEFT JOIN anchorEpisodePlays e ON p.account_id = e.account_id AND e.episode_id = mapping.web_episode_id
WHERE
    p.account_id = @podcast_id
    AND e.date >= @start
    AND e.date <= @end
    AND t.date = (
        SELECT MAX(date)
        FROM anchorTotalPlaysByEpisode
        WHERE 
            account_id = @podcast_id
            -- as this table stores always the total number of yesterday
            AND date BETWEEN @start AND DATE_ADD(@end, INTERVAL 1 DAY)
    )
GROUP BY 
    e.episode_id, p.title, t.plays
ORDER BY 
    total_plays DESC 
