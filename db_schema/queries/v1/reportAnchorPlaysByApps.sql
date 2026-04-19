SELECT 
    a.account_id,
    MAX(a.date) as `date`,
    a.app,
    SUM(a.plays_percent * b.plays) / NULLIF(SUM(b.plays), 0) as plays_percent
FROM
    anchorPlaysByApp a
JOIN anchorPlays b
    ON a.account_id = b.account_id
    AND a.date = b.date
WHERE
    a.date >= @start
    AND a.date <= @end
    AND a.account_id = @podcast_id
GROUP BY
    a.account_id,
    a.app
