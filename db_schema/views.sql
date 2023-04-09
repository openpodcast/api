CREATE OR REPLACE VIEW spotifyEpisodeBase AS
  SELECT
    spotifyEpisodeListeners.account_id,
    spotifyEpisodeListeners.episode_id,
    spotifyEpisodeListeners.spl_count as spotify_listeners,
    spotifyEpisodePerformance.spp_median_percentage as spotify_median_percentage,
    spotifyEpisodePerformance.spp_median_seconds as spotify_median_seconds,
    spotifyEpisodePerformance.spp_sample_max as spotify_sample_max,
    spotifyEpisodePerformance.spp_sample_seconds as spotify_sample_seconds,
    spotifyEpisodePerformance.spp_percentile_25 as spotify_quarter1_percentage,
    spotifyEpisodePerformance.spp_percentile_75 as spotify_quarter3_percentage,
    spotifyEpisodePerformance.spp_percentile_50 as spotify_quarter2_percentage,
    spotifyEpisodePerformance.spp_percentile_100 as spotify_quarter4_percentage
  FROM
  spotifyEpisodeListeners
  JOIN spotifyEpisodePerformance
  ON (spotifyEpisodeListeners.account_id = spotifyEpisodePerformance.account_id
    AND spotifyEpisodeListeners.episode_id = spotifyEpisodePerformance.episode_id
    AND spotifyEpisodeListeners.spl_date = spotifyEpisodePerformance.spp_date);

CREATE OR REPLACE VIEW spotifyPodcastAgeBase AS
WITH data as (
  SELECT *
  FROM spotifyPodcastAggregate
  WHERE spa_facet_type="age"
)

SELECT account_id, spa_date as `date`, "female" as gender, spa_gender_female as listeners, spa_facet as age_group FROM data 
UNION SELECT account_id, spa_date as `date`,  "male" as gender, spa_gender_male as listeners, spa_facet as age_group FROM data 
UNION SELECT account_id, spa_date as `date`, "non-binary" as gender, spa_gender_non_binary as listeners, spa_facet as age_group FROM data 
UNION SELECT account_id, spa_date as `date`, "not-specified" as gender, spa_gender_not_specified as listeners, spa_facet as age_group FROM data;