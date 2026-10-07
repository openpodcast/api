-- weight each daily snapshot by the plays of that day; the denominator must be
-- the plays of all snapshot days, otherwise values missing on some days get inflated
WITH weights AS (
    SELECT
        b.date,
        b.plays
    FROM
        anchorPlays b
    WHERE
        b.account_id = @podcast_id
        AND b.date IN (
            SELECT DISTINCT date FROM anchorPlaysByApp
            WHERE account_id = @podcast_id AND date >= @start AND date <= @end
        )
)
SELECT 
    a.account_id,
    MAX(a.date) as `date`,
    a.app,
    SUM(a.plays_percent * w.plays) / NULLIF((SELECT SUM(plays) FROM weights), 0) as plays_percent
FROM
    anchorPlaysByApp a
JOIN weights w
    ON a.date = w.date
WHERE
    a.date >= @start
    AND a.date <= @end
    AND a.account_id = @podcast_id
GROUP BY
    a.account_id,
    a.app
