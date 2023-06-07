WITH last_date AS (
    SELECT
        MAX(date) as last_date
    FROM
        anchorEpisodePerformance
    WHERE
        date >= @start
        AND date <= @end
        AND account_id = @podcast_id
)

SELECT
  account_id,
  `date`,
  episode_id,
  max_listeners,
  samples
FROM
  anchorEpisodePerformance
WHERE
  date = (SELECT last_date FROM last_date)
  AND account_id = @podcast_id