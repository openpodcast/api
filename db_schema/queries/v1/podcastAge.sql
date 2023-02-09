WITH data as
(SELECT spa_facet, spa_gender_female+spa_gender_male+spa_gender_non_binary+spa_gender_not_specified as listeners
FROM spotifyPodcastAggregate
WHERE spa_facet_type="age" AND spa_date = (SELECT max(spa_date) FROM spotifyPodcastAggregate)
)

SELECT
spa_facet as age_group, listeners, ROUND(listeners/(SELECT SUM(listeners) FROM data)*100,2) as percent
FROM data
