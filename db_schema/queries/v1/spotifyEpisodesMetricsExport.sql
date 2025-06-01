WITH latest_date AS (
    SELECT 
        MAX(epm_date) as max_date
    FROM spotifyEpisodeMetadataHistory
    WHERE account_id = @podcast_id
        AND epm_date >= @start
        AND epm_date <= @end
),
episode_metadata AS (
    SELECT 
        account_id,
        episode_id,
        ep_name as episode_name,
        ep_duration as duration_seconds,
        ep_language as language,
        ep_release_date as release_date
    FROM spotifyEpisodeMetadata
    WHERE account_id = @podcast_id
),
episode_performance AS (
    SELECT 
        account_id,
        episode_id,
        spp_percentile_25 as quartile_1,
        spp_percentile_50 as quartile_2, 
        spp_percentile_75 as quartile_3,
        spp_percentile_100 as quartile_4
    FROM spotifyEpisodePerformance
    WHERE account_id = @podcast_id
    AND spp_date = (SELECT max_date FROM latest_date)
),
episode_streams AS (
    SELECT 
        account_id,
        episode_id,
        epm_starts as total_starts,
        epm_streams as total_streams,
        epm_listeners as total_listeners
    FROM spotifyEpisodeMetadataHistory
    WHERE account_id = @podcast_id
    AND epm_date = (SELECT max_date FROM latest_date)
),
episode_age AS (
    SELECT 
        account_id,
        episode_id,
        -- Age demographics
        SUM(CASE WHEN spa_facet_type = 'age' AND spa_facet = '0-17' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END)/SUM(CASE WHEN spa_facet_type = 'age_sum' AND spa_facet = 'ALL' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END) as age_0_17,
        SUM(CASE WHEN spa_facet_type = 'age' AND spa_facet = '18-22' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END)/SUM(CASE WHEN spa_facet_type = 'age_sum' AND spa_facet = 'ALL' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END) as age_18_22,
        SUM(CASE WHEN spa_facet_type = 'age' AND spa_facet = '23-27' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END)/SUM(CASE WHEN spa_facet_type = 'age_sum' AND spa_facet = 'ALL' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END) as age_23_27,
        SUM(CASE WHEN spa_facet_type = 'age' AND spa_facet = '28-34' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END)/SUM(CASE WHEN spa_facet_type = 'age_sum' AND spa_facet = 'ALL' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END) as age_28_34,
        SUM(CASE WHEN spa_facet_type = 'age' AND spa_facet = '35-44' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END)/SUM(CASE WHEN spa_facet_type = 'age_sum' AND spa_facet = 'ALL' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END) as age_35_44,
        SUM(CASE WHEN spa_facet_type = 'age' AND spa_facet = '45-59' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END)/SUM(CASE WHEN spa_facet_type = 'age_sum' AND spa_facet = 'ALL' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END) as age_45_59,
        SUM(CASE WHEN spa_facet_type = 'age' AND spa_facet = '60-150' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END)/SUM(CASE WHEN spa_facet_type = 'age_sum' AND spa_facet = 'ALL' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END) as age_60_plus,
        SUM(CASE WHEN spa_facet_type = 'age' AND spa_facet = "unknown" THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END)/SUM(CASE WHEN spa_facet_type = 'age_sum' AND spa_facet = 'ALL' THEN spa_gender_female + spa_gender_male + spa_gender_non_binary + spa_gender_not_specified ELSE 0 END) as age_unknown
    FROM spotifyEpisodeAggregate
    WHERE account_id = @podcast_id
    GROUP BY account_id, episode_id
),
episode_gender AS (
    SELECT 
        account_id,
        episode_id,
        male_percent,
        female_percent,
        non_binary_percent,
        not_specified_percent
    FROM spotifyEpisodeGenderStats
    WHERE account_id = @podcast_id
)

SELECT 
    em.episode_id,
    em.episode_name,
    em.duration_seconds,
    em.language,
    em.release_date,
    COALESCE(es.total_starts, 0) as total_starts,
    COALESCE(es.total_streams, 0) as total_streams,
    COALESCE(es.total_listeners, 0) as total_listeners,

    COALESCE(eg.male_percent, 0) as male_percent,
    COALESCE(eg.female_percent, 0) as female_percent,
    COALESCE(eg.non_binary_percent, 0) as non_binary_percent,
    COALESCE(eg.not_specified_percent, 0) as not_specified_percent,

    COALESCE(ed.age_18_22, 0) as age_18_22,
    COALESCE(ed.age_23_27, 0) as age_23_27,
    COALESCE(ed.age_28_34, 0) as age_28_34,
    COALESCE(ed.age_35_44, 0) as age_35_44,
    COALESCE(ed.age_45_59, 0) as age_45_59,
    COALESCE(ed.age_60_plus, 0) as age_60_plus,

    COALESCE(ep.quartile_1, 0) as quartile_1,
    COALESCE(ep.quartile_2, 0) as quartile_2,
    COALESCE(ep.quartile_3, 0) as quartile_3,
    COALESCE(ep.quartile_4, 0) as quartile_4
FROM episode_metadata em
LEFT JOIN episode_performance ep ON em.account_id = ep.account_id AND em.episode_id = ep.episode_id
LEFT JOIN episode_streams es ON em.account_id = es.account_id AND em.episode_id = es.episode_id
LEFT JOIN episode_age ed ON em.account_id = ed.account_id AND em.episode_id = ed.episode_id
LEFT JOIN episode_gender eg ON em.account_id = eg.account_id AND em.episode_id = eg.episode_id
WHERE em.account_id = @podcast_id
ORDER BY em.release_date DESC, em.episode_name