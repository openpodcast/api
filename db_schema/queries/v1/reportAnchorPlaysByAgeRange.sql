WITH last_date AS (
    SELECT
        MAX(date) as last_date
    FROM
        anchorPlaysByAgeRange
    WHERE
        date >= @start
        AND date <= @end
        AND account_id = @podcast_id
)
SELECT 
    account_id,
    `date`,
    age_range,
    plays_percent
FROM
    anchorPlaysByAgeRange
WHERE
    date = (SELECT last_date FROM last_date)
    AND account_id = @podcast_id