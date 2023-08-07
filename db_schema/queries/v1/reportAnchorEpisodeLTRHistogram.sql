WITH last_date AS (
    SELECT
        MAX(date) as last_date
    FROM
        anchorEpisodePerformance
    WHERE
        date >= @start
        AND date <= @end
        AND account_id = @podcast_id
),
plays AS (
    SELECT
      account_id,
      episode_id,
      SUM(plays) as plays
    FROM
        anchorEpisodePlays
    WHERE
        date >= @start AND date <= @end
        AND account_id = @podcast_id
    GROUP BY account_id,episode_id
)

SELECT
  account_id,
  `date`,
  episode_id,
  max_listeners,
  samples,
  plays
FROM
  anchorEpisodePerformance JOIN plays USING (account_id, episode_id)
WHERE
  date = (SELECT last_date FROM last_date)
  AND account_id = @podcast_id