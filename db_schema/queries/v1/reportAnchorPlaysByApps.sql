WITH last_date AS (
    SELECT
        MAX(date) as last_date
    FROM
        anchorPlaysByApp
    WHERE
        date >= @start
        AND date <= @end
        AND account_id = @podcast_id
)
SELECT 
    account_id,
    `date`,
    app,
    plays_percent
FROM
    anchorPlaysByApp
WHERE
    date = (SELECT last_date FROM last_date)
    AND account_id = @podcast_id