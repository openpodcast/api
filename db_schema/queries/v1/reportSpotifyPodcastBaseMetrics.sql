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
followers_start AS (
  SELECT
    account_id as podcast_id,
    spf_count as spotify_followers
  FROM
    spotifyPodcastFollowers
  WHERE
    spf_date = @start
    AND account_id = @podcast_id 
),
followers_end AS (
  SELECT
    account_id as podcast_id,
    spf_count as spotify_followers
  FROM
    spotifyPodcastFollowers
  WHERE
    spf_date = @end
    AND account_id = @podcast_id 
)
SELECT
  streams.podcast_id,
  spotify_starts,
  spotify_streams,
  followers_start.spotify_followers as spotify_followers_start,
  followers_end.spotify_followers as spotify_followers_end
FROM
  streams 
LEFT JOIN followers_start ON streams.podcast_id = followers_start.podcast_id
LEFT JOIN followers_end ON streams.podcast_id = followers_end.podcast_id
