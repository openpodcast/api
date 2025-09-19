-- EXPLAIN analysis for episodesTotalMetrics query performance
-- Use these queries to analyze index usage and identify bottlenecks

-- Current optimized query
EXPLAIN FORMAT=JSON
SELECT
    em.account_id,
    em.spotify_episode_id,
    em.apple_episode_id,
    em.guid,
    COALESCE(aed.aed_date, semh.epm_date) as date,
    aed.aed_playscount as total_apple_plays,
    aed.aed_uniquelistenerscount as total_apple_listeners,
    aed.aed_uniqueengagedlistenerscount as total_apple_engaged_listeners,
    aed.aed_totaltimelistened as total_apple_time_listened,
    aed.aed_engagedplayscount as total_apple_engaged_plays,
    semh.epm_starts as total_spotify_starts,
    semh.epm_streams as total_spotify_streams,
    semh.epm_listeners as total_spotify_listeners
FROM episodeMapping em
LEFT JOIN appleEpisodeDetails aed
    ON em.account_id = aed.account_id
    AND em.apple_episode_id = aed.episode_id
    AND aed.aed_date BETWEEN '2024-01-01' AND '2024-12-31'
LEFT JOIN spotifyEpisodeMetadataHistory semh
    ON em.account_id = semh.account_id
    AND em.spotify_episode_id = semh.episode_id
    AND semh.epm_date BETWEEN '2024-01-01' AND '2024-12-31'
WHERE em.account_id = 2
    AND (aed.aed_date BETWEEN '2024-01-01' AND '2024-12-31' OR semh.epm_date BETWEEN '2024-01-01' AND '2024-12-31')
ORDER BY em.ep_name;

-- Original query for comparison
EXPLAIN FORMAT=JSON
SELECT
    em.account_id,
    em.spotify_episode_id,
    em.apple_episode_id,
    em.guid,
    COALESCE(aed.aed_date, semh.epm_date) as date,
    aed.aed_playscount as total_apple_plays,
    aed.aed_uniquelistenerscount as total_apple_listeners,
    aed.aed_uniqueengagedlistenerscount as total_apple_engaged_listeners,
    aed.aed_totaltimelistened as total_apple_time_listened,
    aed.aed_engagedplayscount as total_apple_engaged_plays,
    semh.epm_starts as total_spotify_starts,
    semh.epm_streams as total_spotify_streams,
    semh.epm_listeners as total_spotify_listeners
FROM episodeMapping em
LEFT JOIN appleEpisodeDetails aed
    ON em.account_id = aed.account_id
    AND em.apple_episode_id = aed.episode_id
LEFT JOIN spotifyEpisodeMetadataHistory semh
    ON em.account_id = semh.account_id
    AND em.spotify_episode_id = semh.episode_id
    AND semh.epm_date = aed.aed_date
WHERE em.account_id = 2
    AND COALESCE(aed.aed_date, semh.epm_date) BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY em.ep_name;

-- Also analyze the episodeMapping view specifically
EXPLAIN FORMAT=JSON
SELECT * FROM episodeMapping WHERE account_id = 2;

-- Check what indexes exist
SHOW INDEXES FROM appleEpisodeDetails;
SHOW INDEXES FROM spotifyEpisodeMetadataHistory;
SHOW INDEXES FROM appleEpisodeMetadata;
SHOW INDEXES FROM spotifyEpisodeMetadata;