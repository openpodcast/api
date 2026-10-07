-- weight each daily snapshot by the plays of that day; the denominator must be
-- the plays of all snapshot days, otherwise values missing on some days get inflated
WITH geo_weights AS (
    SELECT
        b.date,
        b.plays
    FROM
        anchorPlays b
    WHERE
        b.account_id = @podcast_id
        AND b.date IN (
            SELECT DISTINCT date FROM anchorPlaysByGeo
            WHERE account_id = @podcast_id AND date >= @start AND date <= @end
        )
),
top_country AS (
    SELECT
        a.geo as country,
        SUM(a.plays_percent * w.plays) / NULLIF((SELECT SUM(plays) FROM geo_weights), 0) as plays_percent
    FROM
        anchorPlaysByGeo a
    JOIN geo_weights w
        ON a.date = w.date
    WHERE
        a.date >= @start
        AND a.date <= @end
        AND a.account_id = @podcast_id
        -- city data is only fetched for some countries, so pick the top country that has it
        AND a.geo IN (
            SELECT DISTINCT country FROM anchorPlaysByGeoCity
            WHERE account_id = @podcast_id AND date >= @start AND date <= @end
        )
    GROUP BY
        a.account_id,
        a.geo
    ORDER BY plays_percent DESC
    LIMIT 1
),
city_weights AS (
    SELECT
        b.date,
        b.plays
    FROM
        anchorPlays b
    WHERE
        b.account_id = @podcast_id
        AND b.date IN (
            SELECT DISTINCT date FROM anchorPlaysByGeoCity
            WHERE account_id = @podcast_id AND date >= @start AND date <= @end
                AND country = (SELECT country FROM top_country)
        )
)
SELECT
    a.account_id,
    MAX(a.date) as `date`,
    a.country,
    a.city,
    SUM(a.plays_percent * w.plays) / NULLIF((SELECT SUM(plays) FROM city_weights), 0) as plays_percent
FROM
    anchorPlaysByGeoCity a
JOIN city_weights w
    ON a.date = w.date
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
