-- This is the same endpoint as podcastAge,
-- but it only gets the latest date as it is used for the podcast report

WITH latest_date as
(
  SELECT
  MAX(spa_date) as latest_date
  FROM spotifyPodcastAggregate
  WHERE
  spa_facet_type="age"
  AND account_id = @podcast_id
  AND spa_date >= @start
  AND spa_date <= @end
),
data as
(
  SELECT
  spa_facet,
  spa_gender_female+spa_gender_male+spa_gender_non_binary+spa_gender_not_specified as listeners,
  spa_date
  FROM spotifyPodcastAggregate
  WHERE
  spa_facet_type="age"
  AND account_id = @podcast_id
  AND spa_date >= @start
  AND spa_date <= @end
)
SELECT
spa_date as `date`,
spa_facet as age_group,
listeners,
ROUND(listeners/(SELECT SUM(listeners) FROM data WHERE spa_date=final.spa_date)*100,2) as percent
FROM data as final
WHERE spa_date = (SELECT latest_date FROM latest_date)