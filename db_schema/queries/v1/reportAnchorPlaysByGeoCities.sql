WITH last_date AS (
    SELECT 
        MAX(date) AS max_date
    FROM 
        anchorPlaysByGeoCity
    WHERE
        date >= @start
        AND date <= @end
        AND account_id = @podcast_id
),
top_country AS (
    SELECT
        geo as country
    FROM
        anchorPlaysByGeo
    WHERE
        date = (SELECT max_date FROM last_date)
        AND account_id = @podcast_id
    ORDER BY plays_percent DESC
    LIMIT 1
)
SELECT
    account_id,
    `date`,
    country,
    city,
    plays_percent
FROM
    anchorPlaysByGeoCity
WHERE
    date = (SELECT max_date FROM last_date)
    AND account_id = @podcast_id
    AND country = (SELECT country FROM top_country)
ORDER BY plays_percent DESC;