SELECT 
    a.account_id,
    MAX(a.date) as `date`,
    a.device,
    SUM(a.plays_percent * b.plays) / SUM(b.plays) as plays_percent
FROM
    anchorPlaysByDevice a
JOIN anchorPlays b
    ON a.account_id = b.account_id
    AND a.date = b.date
WHERE
    a.date >= @start
    AND a.date <= @end
    AND a.account_id = @podcast_id
GROUP BY
    a.account_id,
    a.device
