WITH data as
(
  SELECT
  spa_facet,
  spa_gender_female+spa_gender_male+spa_gender_non_binary+spa_gender_not_specified as listeners,
  spa_date
  FROM spotifyPodcastAggregate
  WHERE
  spa_facet_type="age"
  AND spa_date >= @start
  AND spa_date <= @end
  AND account_id = 1
)

SELECT
spa_date as `date`,
spa_facet as age_group,
listeners,
ROUND(listeners/(SELECT SUM(listeners) FROM data WHERE spa_date=final.spa_date)*100,2) as percent
FROM data as final
