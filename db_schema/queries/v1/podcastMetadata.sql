-- Combined podcast metadata from Apple and Spotify platforms
-- Returns the latest metadata information for the podcast

SELECT 
    pm.account_id,
    pm.name as podcast_name,
    pm.artwork_url,
    pm.release_date as podcast_release_date,
    pm.url as podcast_url,
    pm.publisher,
    pm.updated_at as metadata_last_updated,
    
    -- Latest Spotify metadata stats
    spm.spm_date as spotify_last_update_date,
    spm.spm_total_episodes as spotify_total_episodes,
    spm.spm_starts as spotify_latest_starts,
    spm.spm_streams as spotify_latest_streams,
    spm.spm_listeners as spotify_latest_listeners,
    spm.spm_followers as spotify_latest_followers,
    
    -- Apple follower data (latest available - not limited by date range)
    atf.atf_date as apple_followers_last_update,
    atf.atf_totalfollowers as apple_total_followers,
    atf.atf_totalunfollowers as apple_total_unfollowers

FROM podcastMetadata pm

-- Get latest Spotify podcast metadata
LEFT JOIN (
    SELECT account_id, spm_date, spm_total_episodes, spm_starts, spm_streams, spm_listeners, spm_followers
    FROM spotifyPodcastMetadata 
    WHERE account_id = @podcast_id
        AND spm_date BETWEEN @start AND @end
    ORDER BY spm_date DESC 
    LIMIT 1
) spm ON pm.account_id = spm.account_id

-- Get latest Apple followers data (not restricted by date range to always show most recent data)
LEFT JOIN (
    SELECT account_id, atf_date, atf_totalfollowers, atf_totalunfollowers, atf_gained, atf_lost
    FROM appleTrendsPodcastFollowers 
    WHERE account_id = @podcast_id
        AND atf_date BETWEEN @start AND @end
    ORDER BY atf_date DESC 
    LIMIT 1
) atf ON pm.account_id = atf.account_id

WHERE pm.account_id = @podcast_id