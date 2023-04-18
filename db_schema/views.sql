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

-- Mapping View between Apple and Spotify episode ids
CREATE OR REPLACE VIEW episodeMapping AS
SELECT
  account_id,
  spotify.episode_id as spotify_episode_id,
  apple.episode_id as apple_episode_id,
  ep_guid as guid
FROM 
  spotifyEpisodeMetadata spotify JOIN appleEpisodeMetadata apple USING (account_id, ep_name);

CREATE OR REPLACE VIEW appleEpisodesRetention AS
  SELECT 
    subquery.account_id as account_id, 
    subquery.episode_id as episode_id, 
    subquery.aed_date as `date`,
    aem.ep_name as episode_name,
    MAX(subquery.aed_quarter1_median_listeners) AS aed_quarter1_median_listeners,
    MAX(subquery.aed_quarter2_median_listeners) AS aed_quarter2_median_listeners,
    MAX(subquery.aed_quarter3_median_listeners) AS aed_quarter3_median_listeners,
    MAX(subquery.aed_quarter4_median_listeners) AS aed_quarter4_median_listeners,
    MAX(subquery.aed_histogram_max_listeners) AS aed_histogram_max_listeners,
    subquery.aed_quarter1_median_listeners/subquery.aed_histogram_max_listeners*100 as aed_quarter1_median_listeners_percent,
    subquery.aed_quarter2_median_listeners/subquery.aed_histogram_max_listeners*100 as aed_quarter2_median_listeners_percent,
    subquery.aed_quarter3_median_listeners/subquery.aed_histogram_max_listeners*100 as aed_quarter3_median_listeners_percent,
    subquery.aed_quarter4_median_listeners/subquery.aed_histogram_max_listeners*100 as aed_quarter4_median_listeners_percent
  FROM (
    SELECT 
      account_id,
      episode_id,
      aed_date,
      aed_quarter1_median_listeners,
      aed_quarter2_median_listeners,
      aed_quarter3_median_listeners,
      aed_quarter4_median_listeners,
      aed_histogram_max_listeners
    FROM appleEpisodeDetails 
  ) AS subquery
  JOIN appleEpisodeMetadata aem ON subquery.account_id = aem.account_id AND subquery.episode_id = aem.episode_id
  GROUP BY subquery.account_id,
           subquery.aed_date,
           subquery.episode_id,
           aem.ep_name, 
           subquery.aed_quarter1_median_listeners, 
           subquery.aed_quarter2_median_listeners, 
           subquery.aed_quarter3_median_listeners, 
           subquery.aed_quarter4_median_listeners, 
           subquery.aed_histogram_max_listeners;

-- Listen-through-rate (LTR) for Apple Podcasts
CREATE OR REPLACE VIEW appleEpisodesLTR AS  SELECT 
  aed_date as `date`,
  appleEpisodeDetails.account_id,
  ep_name as raw_name,
  aed_quarter1_median_listeners/aed_histogram_max_listeners*100 as quarter1,
  aed_quarter2_median_listeners/aed_histogram_max_listeners*100 as quarter2,
  aed_quarter3_median_listeners/aed_histogram_max_listeners*100 as quarter3,
  aed_quarter4_median_listeners/aed_histogram_max_listeners*100 as quarter4,
  aed_histogram_max_listeners as listeners,
  ep_guid as guid
  FROM appleEpisodeDetails
  LEFT JOIN appleEpisodeMetadata USING (account_id, episode_id);


