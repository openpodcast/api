-- Chart rankings query using provider IDs from podcasts table
-- Requires @account_id parameter to be set

WITH podcast_ids AS (
  SELECT 
    account_id,
    spotify_id,
    apple_id,
    podigee_id,
    anchor_id
  FROM podcasts 
  WHERE account_id = @podcast_id
  LIMIT 1
)

/* unified results with resolved categories/genres */
SELECT 
  'spotify'           AS platform,
  'podcast'           AS item_type,
  pc.showid           AS show_id,
  NULL                AS episode_id,
  pc.region           AS market,
  pc.category         AS chart_name,
  pc.position         AS position,
  pc.date             AS chart_date
FROM openpodcast_charts.podcast_charts pc
WHERE pc.showid = (SELECT spotify_id FROM podcast_ids WHERE spotify_id IS NOT NULL LIMIT 1)
  AND pc.date BETWEEN @start AND @end 

UNION ALL

SELECT
  'spotify'           AS platform,
  'episode'           AS item_type,
  ec.showid           AS show_id,
  ec.episodeid        AS episode_id,
  ec.region           AS market,
  'top_episodes'      AS chart_name,
  ec.position         AS position,
  ec.date             AS chart_date
FROM openpodcast_charts.episode_charts ec
WHERE ec.showid = (SELECT spotify_id FROM podcast_ids WHERE spotify_id IS NOT NULL LIMIT 1)
  AND ec.date BETWEEN @start AND @end

UNION ALL

SELECT
  'apple'             AS platform,
  'podcast'           AS item_type,
  CAST(apc.id AS CHAR)        AS show_id,
  NULL                AS episode_id,
  apc.country         AS market,
  ag.name             AS chart_name,
  apc.position        AS position,
  apc.date            AS chart_date
FROM openpodcast_charts.apple_podcast_charts apc
LEFT JOIN openpodcast_charts.apple_genres ag
       ON apc.genre_id = ag.id
      AND apc.country = ag.country
WHERE apc.id = (SELECT apple_id FROM podcast_ids WHERE apple_id IS NOT NULL LIMIT 1)
  AND apc.date BETWEEN @start AND @end

UNION ALL

SELECT
  'apple'             AS platform,
  'episode'           AS item_type,
  CAST(aec.podcast_id AS CHAR) AS show_id,
  CAST(aec.episode_id AS CHAR) AS episode_id,
  aec.country         AS market,
  ag.name             AS chart_name,
  aec.position        AS position,
  aec.date            AS chart_date
FROM openpodcast_charts.apple_episode_charts aec
LEFT JOIN openpodcast_charts.apple_genres ag
       ON aec.genre_id = ag.id
      AND aec.country = ag.country
WHERE aec.podcast_id = (SELECT apple_id FROM podcast_ids WHERE apple_id IS NOT NULL LIMIT 1)
  AND aec.date BETWEEN @start AND @end

ORDER BY chart_date, platform, item_type, market, position;
