WITH episodeListeners AS
(
    SELECT
        account_id,
        SUM(n.epm_listeners - o.epm_listeners) as listeners
    FROM
        spotifyEpisodeMetadataHistory o
    JOIN spotifyEpisodeMetadataHistory n USING (account_id, episode_id)
    WHERE 
        o.epm_date = (SELECT MAX(epm_date) FROM spotifyEpisodeMetadataHistory WHERE epm_date <= @start AND account_id = @podcast_id)
        AND n.epm_date = (SELECT MAX(epm_date) FROM spotifyEpisodeMetadataHistory WHERE epm_date <= @end AND account_id = @podcast_id)
        AND o.account_id = @podcast_id
    GROUP BY o.account_id
),
podcastListeners AS
(
    SELECT
        account_id,
        n.spm_listeners - o.spm_listeners as listeners
    FROM
        spotifyPodcastMetadata o
    JOIN spotifyPodcastMetadata n USING (account_id)
    WHERE
        o.spm_date = (SELECT MAX(spm_date) FROM spotifyPodcastMetadata WHERE spm_date <= @start AND account_id = @podcast_id)
        AND n.spm_date = (SELECT MAX(spm_date) FROM spotifyPodcastMetadata WHERE spm_date <= @end AND account_id = @podcast_id)
        AND o.account_id = @podcast_id
    LIMIT 1
)
SELECT
    account_id,
    episodeListeners.listeners as unique_podcast_listens,
    podcastListeners.listeners as new_unique_podcast_listeners
FROM episodeListeners 
JOIN podcastListeners USING (account_id)
