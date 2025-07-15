-- Combined episodes metadata from Apple and Spotify platforms using episodeMapping view
-- Returns metadata for all episodes with their basic information

SELECT 
    -- Common episode identifiers from mapping view
    em.account_id,
    em.spotify_episode_id,
    em.apple_episode_id,
    em.ep_name as episode_name,
    em.guid,
    
    -- Spotify metadata
    sem.ep_url as spotify_url,
    sem.ep_release_date as spotify_release_date,
    sem.ep_description as spotify_description,
    sem.ep_duration/1000 as spotify_duration_seconds,
    sem.ep_language as spotify_language,
    sem.ep_explicit as spotify_explicit_content,
    sem.ep_has_video as spotify_has_video,
    sem.ep_artwork_url as spotify_artwork_url,
    
    -- Apple metadata  
    aem.ep_collection_name as apple_collection_name,
    aem.ep_release_datetime as apple_release_datetime,
    aem.ep_release_date as apple_release_date,
    aem.ep_number as apple_episode_number,
    aem.ep_type as apple_episode_type

FROM episodeMapping em

-- Get Spotify episode metadata
LEFT JOIN spotifyEpisodeMetadata sem 
    ON em.account_id = sem.account_id 
    AND em.spotify_episode_id = sem.episode_id

-- Get Apple episode metadata
LEFT JOIN appleEpisodeMetadata aem 
    ON em.account_id = aem.account_id 
    AND em.apple_episode_id = aem.episode_id

WHERE em.account_id = @podcast_id

ORDER BY COALESCE(sem.ep_release_date, aem.ep_release_date) DESC