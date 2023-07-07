WITH episodeListeners as
(SELECT
    account_id,
    SUM(n.epm_listeners-o.epm_listeners) as listeners
FROM
  spotifyEpisodeMetadataHistory o JOIN spotifyEpisodeMetadataHistory n USING (account_id, episode_id)
WHERE 
  o.epm_date = @start
  AND n.epm_date = @end
  AND account_id = @podcast_id
GROUP BY account_id
),
podcastListeners as
(SELECT
    account_id,
    n.spm_listeners-o.spm_listeners as listeners
FROM
    spotifyPodcastMetadata o JOIN spotifyPodcastMetadata n USING (account_id)
WHERE
    o.spm_date = @start
    AND n.spm_date = @end
    AND account_id = @podcast_id
LIMIT 1
)
SELECT
    account_id,
    episodeListeners.listeners as unique_podcast_listens,
    podcastListeners.listeners as new_unique_podcast_listeners
FROM episodeListeners JOIN podcastListeners USING (account_id)