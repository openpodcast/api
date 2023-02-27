WITH data as
(
    SELECT spa_date,ep_guid,spa_facet,spa_gender_female,spa_gender_male,spa_gender_non_binary,spa_gender_not_specified
    FROM spotifyEpisodeAggregate
    JOIN spotifyEpisodeMetadata USING (episode_id)
    JOIN appleEpisodeMetadata ON (spotifyEpisodeMetadata.ep_name=appleEpisodeMetadata.ep_name)
    WHERE
    spa_facet_type="age"
    AND spa_date >= @start
    AND spa_date <= @end  
)

SELECT spa_date as `date`, ep_guid as guid, "female" as gender, spa_gender_female as listeners, spa_facet as age_group FROM data 
UNION SELECT spa_date as `date`, ep_guid as guid, "male" as gender, spa_gender_male as listeners, spa_facet as age_group FROM data
UNION SELECT spa_date as `date`, ep_guid as guid, "non-binary" as gender, spa_gender_non_binary as listeners, spa_facet as age_group FROM data
UNION SELECT spa_date as `date`, ep_guid as guid, "not-specified" as gender, spa_gender_not_specified as listeners, spa_facet as age_group FROM data