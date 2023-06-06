WITH last_date AS (
    SELECT
        MAX(date) as last_date
    FROM
        anchorPlaysByDevice
    WHERE
        date >= @start
        AND date <= @end
        AND account_id = @podcast_id
)
SELECT 
    account_id,
    `date`,
    device,
    plays_percent
FROM
    anchorPlaysByDevice
WHERE
    date = (SELECT last_date FROM last_date)
    AND account_id = @podcast_id