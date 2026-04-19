WITH top_country AS (
    SELECT
        a.geo as country,
        SUM(a.plays_percent * b.plays) / SUM(b.plays) as plays_percent
    FROM
        anchorPlaysByGeo a
    JOIN anchorPlays b
        ON a.account_id = b.account_id
        AND a.date = b.date
    WHERE
        a.date >= @start
        AND a.date <= @end
        AND a.account_id = @podcast_id
    GROUP BY
        a.account_id,
        a.geo
    ORDER BY plays_percent DESC
    LIMIT 1
)
SELECT
    a.account_id,
    MAX(a.date) as `date`,
    a.country,
    a.city,
    SUM(a.plays_percent * b.plays) / SUM(b.plays) as plays_percent
FROM
    anchorPlaysByGeoCity a
JOIN anchorPlays b
    ON a.account_id = b.account_id
    AND a.date = b.date
WHERE
    a.date >= @start
    AND a.date <= @end
    AND a.account_id = @podcast_id
    AND a.country = (SELECT country FROM top_country)
GROUP BY
    a.account_id,
    a.country,
    a.city
ORDER BY plays_percent DESC;
