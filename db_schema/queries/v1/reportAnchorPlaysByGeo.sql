WITH last_date AS (
    SELECT 
        MAX(date) AS max_date
    FROM 
        anchorPlaysByGeo
    WHERE
        date >= @start
        AND date <= @end
        AND account_id = @podcast_id
)
SELECT
    a.account_id,
    a.date,
    a.geo,
    a.plays_percent
FROM
    anchorPlaysByGeo AS a, last_date AS b
WHERE
    a.account_id = @podcast_id
    AND a.date = b.max_date
ORDER BY 
    a.date ASC;