-- Total episodes metrics from Apple and Spotify platforms using episodeMapping view
-- Returns cumulative/total performance metrics for plays, listeners, and engagement data

SELECT 
    -- Episode identifiers from mapping view
    em.account_id,
    em.spotify_episode_id,
    em.apple_episode_id,
    em.guid,
    
    -- Single date field
    COALESCE(aed.aed_date, semh.epm_date) as date,
    
    -- Apple episode details (total metrics)
    aed.aed_playscount as total_apple_plays,
    aed.aed_uniquelistenerscount as total_apple_listeners,
    aed.aed_uniqueengagedlistenerscount as total_apple_engaged_listeners,
    aed.aed_totaltimelistened as total_apple_time_listened,
    aed.aed_engagedplayscount as total_apple_engaged_plays,
    
    -- Spotify episode metadata (total metrics)
    semh.epm_starts as total_spotify_starts,
    semh.epm_streams as total_spotify_streams,
    semh.epm_listeners as total_spotify_listeners
    

FROM episodeMapping em

-- Apple episode details (total metrics)
LEFT JOIN appleEpisodeDetails aed
    ON em.account_id = aed.account_id 
    AND em.apple_episode_id = aed.episode_id

-- Spotify episode metadata history (total metrics)
LEFT JOIN spotifyEpisodeMetadataHistory semh
    ON em.account_id = semh.account_id 
    AND em.spotify_episode_id = semh.episode_id
    AND semh.epm_date = aed.aed_date

WHERE em.account_id = @podcast_id
    AND COALESCE(aed.aed_date, semh.epm_date) BETWEEN @start AND @end

ORDER BY em.ep_name