WITH streams AS (
  SELECT
    account_id as podcast_id,
    SUM(sps_starts) as spotify_starts,
    SUM(sps_streams) as spotify_streams
  FROM
    spotifyPodcastDetailedStreams
  WHERE
    sps_date >= @start
    AND sps_date <= @end
    AND account_id = @podcast_id
  GROUP BY account_id 
),
streamstotal AS (
  SELECT
    *,
    account_id as podcast_id
  FROM spotifyPodcastMetadata
  WHERE
    account_id = @podcast_id
    AND spm_date = (SELECT MAX(spm_date) FROM spotifyPodcastMetadata WHERE account_id = @podcast_id AND spm_date <= @end AND spm_date >= @start)
),
followers_start AS (
  SELECT
    account_id as podcast_id,
    spf_count as spotify_followers
  FROM
    spotifyPodcastFollowers
  WHERE
    spf_date BETWEEN @start AND @end
    AND account_id = @podcast_id 
  ORDER BY spf_date ASC
  LIMIT 1
),
followers_end AS (
  SELECT
    account_id as podcast_id,
    spf_count as spotify_followers
  FROM
    spotifyPodcastFollowers
  WHERE
    spf_date BETWEEN @start AND @end
    AND account_id = @podcast_id 
  ORDER BY spf_date DESC
  LIMIT 1
)
SELECT
  streams.podcast_id,
  spotify_starts,
  spotify_streams,
  followers_start.spotify_followers as spotify_followers_start,
  followers_end.spotify_followers as spotify_followers_end,
  streamstotal.spm_starts as spotify_starts_total,
  streamstotal.spm_streams as spotify_streams_total,
  streamstotal.spm_followers as spotify_followers_total,
  streamstotal.spm_listeners as spotify_listeners_total
FROM
  streams 
LEFT JOIN followers_start ON streams.podcast_id = followers_start.podcast_id
LEFT JOIN followers_end ON streams.podcast_id = followers_end.podcast_id
LEFT JOIN streamstotal ON streams.podcast_id = streamstotal.account_id
