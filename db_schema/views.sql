CREATE OR REPLACE VIEW spotifyEpisodeBase AS
  SELECT
    spotifyEpisodeMetadataHistory.account_id,
    spotifyEpisodeMetadataHistory.episode_id,
    spotifyEpisodeMetadataHistory.epm_date as `date`,
    spotifyEpisodeMetadataHistory.epm_listeners as spotify_listeners,
    spotifyEpisodePerformance.spp_median_percentage as spotify_median_percentage,
    spotifyEpisodePerformance.spp_median_seconds as spotify_median_seconds,
    spotifyEpisodePerformance.spp_sample_max as spotify_sample_max,
    spotifyEpisodePerformance.spp_sample_seconds as spotify_sample_seconds,
    spotifyEpisodePerformance.spp_percentile_25 as spotify_quarter1_percentage,
    spotifyEpisodePerformance.spp_percentile_75 as spotify_quarter3_percentage,
    spotifyEpisodePerformance.spp_percentile_50 as spotify_quarter2_percentage,
    spotifyEpisodePerformance.spp_percentile_100 as spotify_quarter4_percentage
  FROM
  spotifyEpisodeMetadataHistory
  JOIN spotifyEpisodePerformance
  ON (spotifyEpisodeMetadataHistory.account_id = spotifyEpisodePerformance.account_id
    AND spotifyEpisodeMetadataHistory.episode_id = spotifyEpisodePerformance.episode_id
    AND spotifyEpisodeMetadataHistory.epm_date = spotifyEpisodePerformance.spp_date);

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
    today.atf_totalfollowers - today.atf_totalunfollowers as total_followers,
    (today.atf_totalfollowers - today.atf_totalunfollowers) - (yesterday.atf_totalfollowers - yesterday.atf_totalunfollowers) as `change`
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
  ep_name,
  spotify.episode_id as spotify_episode_id,
  apple.episode_id as apple_episode_id,
  ep_guid as guid
FROM 
  spotifyEpisodeMetadata spotify JOIN appleEpisodeMetadata apple USING (account_id, ep_name);


  -- Average LTR Quarters
CREATE OR REPLACE VIEW averageLTRQuarters AS
WITH latestValidDate as (
    SELECT account_id,MAX(spp_date) as date FROM spotifyEpisodePerformance GROUP BY account_id
    union
    SELECT account_id,MAX(aed_date) as date FROM appleEpisodeDetails GROUP BY account_id
),
spotify_avg as (
  SELECT account_id,
    AVG(spp_percentile_25) as spotify_avg_quarter1,
    AVG(spp_percentile_50) as spotify_avg_quarter2,
    AVG(spp_percentile_75) as spotify_avg_quarter3,
    AVG(spp_percentile_100) as spotify_avg_quarter4
  FROM spotifyEpisodePerformance
  WHERE spp_date = (SELECT MIN(date) FROM latestValidDate)
  GROUP BY account_id
),
apple_avg as (
  SELECT account_id,
    AVG(CASE WHEN aed_histogram_max_listeners = 0 THEN 0 ELSE aed_quarter1_median_listeners/aed_histogram_max_listeners*100 END) as apple_avg_quarter1,
    AVG(CASE WHEN aed_histogram_max_listeners = 0 THEN 0 ELSE aed_quarter2_median_listeners/aed_histogram_max_listeners*100 END) as apple_avg_quarter2,
    AVG(CASE WHEN aed_histogram_max_listeners = 0 THEN 0 ELSE aed_quarter3_median_listeners/aed_histogram_max_listeners*100 END) as apple_avg_quarter3,
    AVG(CASE WHEN aed_histogram_max_listeners = 0 THEN 0 ELSE aed_quarter4_median_listeners/aed_histogram_max_listeners*100 END) as apple_avg_quarter4
  FROM appleEpisodeDetails
  WHERE aed_date = (SELECT MIN(date) FROM latestValidDate)
  GROUP BY account_id
)

SELECT * FROM spotify_avg JOIN apple_avg USING (account_id);

-- Average LTR Lines
CREATE OR REPLACE VIEW averageLTR AS
WITH latestValidDate as (
    SELECT account_id,MAX(spp_date) as date FROM spotifyEpisodePerformance GROUP BY account_id
    union
    SELECT account_id,MAX(aed_date) as date FROM appleEpisodeDetails GROUP BY account_id
),
spotify as (
  SELECT account_id,sample_id as sec,
  COUNT(*) as episodes_count,
  AVG(listeners/spp_sample_max) as percent FROM
  spotifyEpisodePerformance CROSS JOIN
  JSON_TABLE(
      spp_samples,
      "$[*]"
      COLUMNS (
        sample_id FOR ORDINALITY,
        listeners INT PATH "$")
  ) samples
  WHERE spp_date = (SELECT MIN(date) FROM latestValidDate)
  GROUP BY account_id,sample_id
  -- consider only samples with more than 2 underlying episodes
  HAVING count(*) > 2
),
apple as (
  SELECT account_id,
  -- extract from json data row like {"0": 5}
  -- apple is already in 15 sec buckets
  CAST(JSON_EXTRACT(JSON_KEYS(val),"$[0]") as UNSIGNED) as sec,
  -- extract value from json data row like {"0": 5} and divide by max listeners
  AVG(JSON_EXTRACT(JSON_EXTRACT(val,"$.*"),"$[0]")/aed_histogram_max_listeners) as percent,
  COUNT(*) as episodes_count
  FROM
    appleEpisodeDetails CROSS JOIN
    -- extract the elements in form of {"0": 5} per row
    JSON_TABLE(
        aed_play_histogram,
        "$[*]"
        COLUMNS (
          val JSON PATH "$"
        )
    ) samples
  WHERE aed_date = (SELECT MIN(date) FROM latestValidDate)
  GROUP BY account_id,sec
  -- consider only samples with more than 2 underlying episodes
  HAVING count(*) > 2
)

SELECT account_id,sec,
spotify.percent*100 as spotify_percent,
apple.percent*100 as apple_percent,
spotify.episodes_count as spotify_episodes_count,
apple.episodes_count as apple_episodes_count
FROM spotify LEFT JOIN apple USING (account_id,sec);

-- Listen-through-rate (LTR) for Apple Podcasts
CREATE OR REPLACE VIEW appleEpisodesLTR AS  SELECT 
  aed_date as `date`,
  appleEpisodeDetails.account_id,
  appleEpisodeDetails.episode_id,
  ep_name as raw_name,
  aed_quarter1_median_listeners/aed_histogram_max_listeners*100 as quarter1,
  aed_quarter2_median_listeners/aed_histogram_max_listeners*100 as quarter2,
  aed_quarter3_median_listeners/aed_histogram_max_listeners*100 as quarter3,
  aed_quarter4_median_listeners/aed_histogram_max_listeners*100 as quarter4,
  aed_uniquelistenerscount as listeners,
  ep_guid as guid
  FROM appleEpisodeDetails
  LEFT JOIN appleEpisodeMetadata USING (account_id, episode_id);


-- Normalize Spotify LTR to 15sec buckets to be usable together with Apple LTR
CREATE OR REPLACE VIEW spotifyEpisodePerformance15SecBuckets AS
  SELECT JSON_ARRAYAGG(JSON_OBJECT(sample_id-1,listeners)) as histogram,episode_id,account_id,spp_date,spp_sample_max FROM 
    spotifyEpisodePerformance CROSS JOIN
    JSON_TABLE(
        spp_samples,
        "$[*]"
        COLUMNS (
          sample_id FOR ORDINALITY,
          listeners INT PATH "$"
        )
    ) samples
  WHERE
    -- just show numbers every 15 seconds and the first+last one
    -- as we start with 0 and decrease sample_id by 1, calc -1 % 15
    (MOD(sample_id-1,15) = 0 OR sample_id = 1 OR spp_sample_seconds = sample_id)
  GROUP BY account_id,episode_id,spp_sample_max,spp_date;

-- clean votes and ignore votes by bots and spider
CREATE OR REPLACE VIEW feedbackVoteCleaned AS
  SELECT * FROM feedbackVote
  WHERE agent NOT LIKE "%Bot%"
  AND agent <> "Google"
  AND agent <> "Google-Safety";
