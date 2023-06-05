SELECT 
  account_id,
  date,
  plays
FROM
    anchorPlays
WHERE
    date >= @start
    AND date <= @end
    AND account_id = @podcast_id
ORDER BY date ASC
