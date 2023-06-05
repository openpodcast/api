WITH anchor_total_podcast AS (
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
anchor_total_by_episode AS (
  SELECT
    account_id,
    date,
    AVG(plays) as average_plays
  FROM
    anchorTotalPlaysByEpisode
  WHERE
    date >= @start
    AND date <= @end
    AND account_id = @podcast_id
  GROUP BY
    account_id,
    date
)
SELECT
  atp.plays as anchor_total_plays,
  atbe.average_plays as anchor_average_total_plays
FROM
  anchor_total_podcast atp
JOIN anchor_total_by_episode atbe ON atp.account_id = atbe.account_id AND atp.date = atbe.date
GROUP BY atp.account_id, atp.plays, atbe.average_plays;