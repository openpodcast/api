SELECT 
    a.account_id,
    MAX(a.date) as `date`,
    a.age_range,
    SUM(a.plays_percent * b.plays) / NULLIF(SUM(b.plays), 0) as plays_percent
FROM
    anchorPlaysByAgeRange a
JOIN anchorPlays b
    ON a.account_id = b.account_id
    AND a.date = b.date
WHERE
    a.date >= @start
    AND a.date <= @end
    AND a.account_id = @podcast_id
GROUP BY
    a.account_id,
    a.age_range
