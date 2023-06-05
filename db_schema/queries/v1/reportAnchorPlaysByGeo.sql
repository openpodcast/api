SELECT
    account_id,
    date,
    geo,
    plays_percent
FROM
    anchorPlaysByGeo
WHERE
    date >= @start
    AND date <= @end
    AND account_id = @podcast_id
ORDER BY date ASC