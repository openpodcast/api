WITH 
plays_in_period AS (
  SELECT account_id, sum(plays) as period_plays FROM anchorPlays 
  WHERE account_id = @podcast_id AND date BETWEEN @start AND @end
  GROUP BY account_id
)
SELECT
  plays as total_plays,
  period_plays as plays_within_period
FROM
  anchorTotalPlays JOIN plays_in_period USING (account_id)
WHERE
  account_id = @podcast_id
  AND date BETWEEN @start AND @end
  -- use the newest data available in the date range
  ORDER BY date DESC
  LIMIT 1;