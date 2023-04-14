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


-- Followers gain/growth
CREATE OR REPLACE VIEW podcastFollowers AS
WITH
spotify as (
  SELECT
    today.account_id,
    today.spf_date as `date`,
    today.spf_count as total_followers,
    today.spf_count-yesterday.spf_count as `change`
  FROM
    spotifyPodcastFollowers as today LEFT JOIN spotifyPodcastFollowers as yesterday 
    ON (yesterday.spf_date=DATE_SUB(today.spf_date, INTERVAL 1 DAY) AND today.account_id=yesterday.account_id)
),
apple as (
  SELECT
    today.account_id, today.atf_date as `date`,
    today.atf_totalfollowers as total_followers,
    today.atf_totalfollowers-yesterday.atf_totalfollowers as `change`
  FROM
    appleTrendsPodcastFollowers as today LEFT JOIN appleTrendsPodcastFollowers as yesterday
    ON (yesterday.atf_date=DATE_SUB(today.atf_date, INTERVAL 1 DAY) AND today.account_id=yesterday.account_id)
)

SELECT
  spotify.account_id, spotify.date,
  spotify.total_followers as spotify_total_followers,
  spotify.change as spotify_change_to_day_before,
  apple.total_followers as apple_total_followers,
  apple.change as apple_change_to_day_before
FROM
  spotify JOIN apple
  ON (spotify.account_id=apple.account_id AND spotify.date=apple.date)
WHERE
  spotify.total_followers IS NOT NULL
  AND apple.total_followers IS NOT NULL;