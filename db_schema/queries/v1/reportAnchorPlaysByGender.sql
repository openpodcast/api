WITH last_date AS (
    SELECT
        MAX(date) as last_date
    FROM
        anchorPlaysByGender
    WHERE
        date >= @start
        AND date <= @end
        AND account_id = @podcast_id
)
SELECT 
    account_id,
    `date`,
    gender,
    plays_percent
FROM
    anchorPlaysByGender
WHERE
    date = (SELECT last_date FROM last_date)
    AND account_id = @podcast_id