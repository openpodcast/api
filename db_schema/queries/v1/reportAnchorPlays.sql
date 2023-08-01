 
WITH 
first_date AS (
  SELECT 
    MIN(date) as first_date
  FROM 
    anchorTotalPlays
  WHERE 
    date >= @start
    AND date <= @end
    AND account_id = @podcast_id
),
last_date AS (
  SELECT 
    MAX(date) as last_date
  FROM 
    anchorTotalPlays
  WHERE 
    date >= @start
    AND date <= @end
    AND account_id = @podcast_id
),
anchor_total_podcast AS (
  SELECT 
    account_id,
    date,
    plays 
  FROM
    anchorTotalPlays
  WHERE
    date >= @start
    AND date <= @end
    AND account_id = @podcast_id
),
first_day_plays AS (
  SELECT
    atp.plays as first_day_plays
  FROM
    anchor_total_podcast atp
  JOIN
    first_date fd
  ON
    atp.date = fd.first_date
),
last_day_plays AS (
  SELECT
    atp.plays as last_day_plays
  FROM
    anchor_total_podcast atp
  JOIN
    last_date ld
  ON
    atp.date = ld.last_date
)
SELECT
  ldp.last_day_plays as total_plays,
  (ldp.last_day_plays - fdp.first_day_plays) as plays_within_period
FROM
  first_day_plays fdp, last_day_plays ldp;