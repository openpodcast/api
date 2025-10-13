-- @doc
-- Returns daily performance metrics for plays, listeners, streams, and engagement data of episodes from Apple and Spotify.
-- Fields: Podcast ID, Spotify Episode ID, Apple Episode ID, GUID, Date, Spotify Starts, Spotify Streams, Spotify Listeners, Apple Plays, Apple Unique Listeners, Apple Engaged Listeners, Apple Total Time Listened

SELECT 
    -- Episode identifiers from mapping view
    em.account_id,
    em.spotify_episode_id,
    em.apple_episode_id,
    em.guid,
    
    -- Single date field for exact date matching
    COALESCE(seds.sps_date, sel.spl_date) as date,
    
    -- Spotify detailed streams (daily metrics)
    seds.sps_starts as spotify_starts,
    seds.sps_streams as spotify_streams,
    
    -- Spotify listeners (daily metrics)
    sel.spl_count as spotify_listeners,
    
    -- Apple trends (daily metrics - exact date match)
    atel.atl_playscount as apple_plays,
    atel.atl_uniquelistenerscount as apple_listeners,
    atel.atl_uniqueengagedlistenerscount as apple_engaged_listeners,
    atel.atl_totaltimelistened as apple_time_listened

FROM episodeMapping em

-- Spotify detailed streams (daily data)
JOIN spotifyEpisodeDetailedStreams seds 
    ON em.account_id = seds.account_id 
    AND em.spotify_episode_id = seds.episode_id

-- Spotify listeners (daily data) - match exact date with streams
JOIN spotifyEpisodeListeners sel
    ON em.account_id = sel.account_id 
    AND em.spotify_episode_id = sel.episode_id
    AND sel.spl_date = seds.sps_date

-- Apple trends episode listeners (exact date match with Spotify)
LEFT JOIN appleTrendsEpisodeListeners atel
    ON em.account_id = atel.account_id 
    AND em.apple_episode_id = atel.episode_id
    AND atel.atl_date = sel.spl_date

WHERE em.account_id = @podcast_id
    AND COALESCE(seds.sps_date, sel.spl_date) BETWEEN @start AND @end

ORDER BY 
    em.ep_name,
    COALESCE(seds.sps_date, sel.spl_date) DESC