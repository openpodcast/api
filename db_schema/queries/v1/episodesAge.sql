WITH data as
(
  SELECT spa_date,episode_id,spa_facet,spa_gender_female+spa_gender_male+spa_gender_non_binary+spa_gender_not_specified as listeners
  FROM spotifyEpisodeAggregate
  WHERE
  spa_facet_type="age"
  AND spa_date >= @start
  AND spa_date <= @end

),
age_sum as (
  SELECT spa_date,episode_id,spa_facet,spa_gender_female+spa_gender_male+spa_gender_non_binary+spa_gender_not_specified as listeners
  FROM spotifyEpisodeAggregate
  WHERE
  spa_facet_type="age_sum"
  AND spa_date >= @start
  AND spa_date <= @end
)

SELECT
spa_date as `date`,
ep_guid as guid,data.spa_facet as age_group,
data.listeners as listeners,
ROUND(data.listeners/age_sum.listeners*100, 2) as percent
FROM data
JOIN age_sum USING (episode_id, spa_date)
JOIN spotifyEpisodeMetadata USING (episode_id)
JOIN appleEpisodeMetadata ON (spotifyEpisodeMetadata.ep_name=appleEpisodeMetadata.ep_name)
