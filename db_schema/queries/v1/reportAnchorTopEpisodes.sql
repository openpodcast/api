SELECT 
    e.episode_id,
    p.title,
    SUM(e.plays) AS total_plays_in_period,
    t.plays AS total_plays
FROM 
    anchorEpisodePlays e
JOIN
    anchorPodcastEpisodes p ON e.account_id = p.account_id AND e.episode_id = p.episode_id
JOIN
    anchorTotalPlaysByEpisode t ON e.account_id = t.account_id AND e.episode_id = t.episode_id
WHERE 
    e.date >= @start
    AND e.date <= @end
    AND e.account_id = @podcast_id
    AND t.date = (
        SELECT MAX(date)
        FROM anchorTotalPlaysByEpisode
        WHERE 
            account_id = @podcast_id
            AND date BETWEEN @start AND @end
    )
GROUP BY 
    e.episode_id, p.title
ORDER BY 
    total_plays DESC
