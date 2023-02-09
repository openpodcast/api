WITH data as (
  SELECT * FROM spotifyPodcastAggregate WHERE spa_facet_type="age" AND spa_date = (SELECT max(spa_date) FROM spotifyPodcastAggregate)
)

SELECT "female" as gender, spa_gender_female as listeners, spa_facet as age_group FROM data 
UNION SELECT "male" as gender, spa_gender_male as listeners, spa_facet as age_group FROM data 
UNION SELECT "non-binary" as gender, spa_gender_non_binary as listeners, spa_facet as age_group FROM data 
UNION SELECT "not-specified" as gender, spa_gender_non_binary as listeners, spa_facet as age_group FROM data 