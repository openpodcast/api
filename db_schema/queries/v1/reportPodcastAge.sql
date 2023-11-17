WITH 
data as
(
  SELECT
  spa_facet as age_group,
  SUM(spa_gender_female+spa_gender_male+spa_gender_non_binary+spa_gender_not_specified) listeners,
  SUM(spa_gender_female) as female,
  SUM(spa_gender_male) as male,
  SUM(spa_gender_non_binary) as non_binary,
  SUM(spa_gender_not_specified) as not_specified
  FROM spotifyPodcastAggregate
  WHERE
  spa_facet_type="age"
  AND account_id = @podcast_id
  AND spa_date >= @start
  AND spa_date <= @end
  GROUP BY spa_facet
)
SELECT
*,
SUM(listeners) OVER() as total_listeners,
ROUND(female/(SUM(listeners) OVER())*100, 2) as female_percent,
ROUND(male/(SUM(listeners) OVER())*100, 2) as male_percent,
ROUND(non_binary/(SUM(listeners) OVER())*100, 2) as non_binary_percent,
ROUND(not_specified/(SUM(listeners) OVER())*100, 2) as not_specified_percent
FROM data