SELECT
  account_id as podcast_id,
  SUM(spm_total_episodes) as spotify_total_episodes,
  SUM(spm_starts) as spotify_starts,
  SUM(spm_streams) as spotify_streams,
  SUM(spm_listeners) as spotify_listeners,
  SUM(spm_followers) as spotify_followers
FROM
  spotifyPodcastMetadata
WHERE
  spm_date >= @start
  AND spm_date <= @end
  AND account_id = @podcast_id
GROUP BY account_id 