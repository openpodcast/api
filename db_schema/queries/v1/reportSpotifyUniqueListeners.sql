WITH episodeListeners as
(
  SELECT
    account_id,
    SUM(n.epm_listeners-o.epm_listeners) as listeners
  FROM
    spotifyEpisodeMetadataHistory o 
    JOIN spotifyEpisodeMetadataHistory n USING (account_id, episode_id)
  WHERE 
    o.epm_date BETWEEN @start AND @end
    AND n.epm_date BETWEEN @start AND @end
    AND account_id = @podcast_id
  GROUP BY account_id
),
podcastListenersStart as
(
  SELECT
    account_id,
    n.spm_listeners-o.spm_listeners as listeners
  FROM
    spotifyPodcastMetadata o 
    JOIN spotifyPodcastMetadata n USING (account_id)
  WHERE
    o.spm_date BETWEEN @start AND @end
    AND account_id = @podcast_id
  ORDER BY o.spm_date ASC
  LIMIT 1
),
podcastListenersEnd as
(
  SELECT
    account_id,
    n.spm_listeners-o.spm_listeners as listeners
  FROM
    spotifyPodcastMetadata o 
    JOIN spotifyPodcastMetadata n USING (account_id)
  WHERE
    n.spm_date BETWEEN @start AND @end
    AND account_id = @podcast_id
  ORDER BY n.spm_date DESC
  LIMIT 1
)
SELECT
    e.account_id,
    e.listeners as unique_podcast_listens,
    p.listeners as new_unique_podcast_listeners
FROM episodeListeners e 
JOIN podcastListenersEnd p USING (account_id)
