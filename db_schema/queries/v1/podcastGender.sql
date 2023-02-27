WITH data as (
  SELECT *
  FROM spotifyPodcastAggregate
  WHERE spa_facet_type="age"
  AND spa_date >= @start
  AND spa_date <= @end  
)

SELECT spa_date as `date`, "female" as gender, spa_gender_female as listeners, spa_facet as age_group FROM data 
UNION SELECT spa_date as `date`,  "male" as gender, spa_gender_male as listeners, spa_facet as age_group FROM data 
UNION SELECT spa_date as `date`, "non-binary" as gender, spa_gender_non_binary as listeners, spa_facet as age_group FROM data 
UNION SELECT spa_date as `date`, "not-specified" as gender, spa_gender_not_specified as listeners, spa_facet as age_group FROM data 