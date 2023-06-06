WITH countries AS (
    SELECT
        geo as top_country
    FROM
        anchorPlaysByGeo
    WHERE
        date >= @start
        AND date <= @end
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
    date >= @start
    AND date <= @end
    AND account_id = @podcast_id
    AND country = (SELECT top_country FROM countries)
ORDER BY plays_percent DESC