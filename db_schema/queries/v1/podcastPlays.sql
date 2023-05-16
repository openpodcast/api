WITH spotify AS (
  SELECT
    account_id,
    spm_date,
    spm_total_episodes,
    spm_starts,
    spm_streams,
    spm_listeners,
    spm_followers
  FROM
    spotifyPodcastMetadata
  WHERE
    spm_date >= @start
    AND spm_date <= @end
    AND account_id = @podcast_id
),
apple AS (
  SELECT
    account_id,
    atl_date,
    atl_playscount,
    atl_totaltimelistened,
    atl_uniqueengagedlistenerscount,
    atl_uniquelistenerscount
  FROM
    appleTrendsPodcastListeners
  WHERE
    atl_date >= @start
    AND atl_date <= @end
    AND account_id = @podcast_id
),
anchor_total_podcast AS (
  SELECT 
    account_id,
    date,
    plays 
  FROM
    anchorTotalPlays
  WHERE
    date >= @start
    AND date <= @end
    AND account_id = @podcast_id
),
anchor_total_by_episode AS (
  SELECT
    account_id,
    date,
    AVG(plays) as average_plays
  FROM
    anchorTotalPlaysByEpisode
  WHERE
    date >= @start
    AND date <= @end
    AND account_id = @podcast_id
  GROUP BY
    account_id,
    date
)
SELECT
  s.account_id as account_id,
  SUM(s.spm_total_episodes) as spotify_total_episodes,
  SUM(s.spm_starts) as spotify_starts,
  SUM(s.spm_streams) as spotify_streams,
  SUM(s.spm_listeners) as spotify_listeners,
  SUM(s.spm_followers) as spotify_followers,
  SUM(a.atl_playscount) as apple_playscount,
  SUM(a.atl_totaltimelistened) as apple_totaltimelistened,
  SUM(a.atl_uniqueengagedlistenerscount) as apple_uniqueengagedlistenerscount,
  SUM(a.atl_uniquelistenerscount) as apple_uniquelistenerscount,
  atp.plays as anchor_total_plays,
  atbe.average_plays as anchor_average_total_plays
FROM
  spotify s
JOIN apple a ON s.account_id = a.account_id AND s.spm_date = a.atl_date
JOIN anchor_total_podcast atp ON s.account_id = atp.account_id AND s.spm_date = atp.date
JOIN anchor_total_by_episode atbe ON atp.account_id = atbe.account_id AND atp.date = atbe.date
GROUP BY s.account_id, atp.plays, atbe.average_plays;