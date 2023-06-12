SELECT 
    e.episode_id,
    p.title,
    SUM(e.plays) AS total_plays
FROM 
    anchorEpisodePlays e
JOIN
    anchorPodcastEpisodes p ON e.account_id = p.account_id AND e.episode_id = p.episode_id
WHERE 
    e.date >= @start
    AND e.date <= @end
    AND e.account_id = @podcast_id
GROUP BY 
    e.episode_id, p.title
ORDER BY 
    total_plays DESC
