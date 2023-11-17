WITH plays AS (
  SELECT
    account_id as podcast_id,
    SUM(atl_playscount) as apple_playscount,
    SUM(atl_totaltimelistened) as apple_totaltimelistened
  FROM
    appleTrendsPodcastListeners
  WHERE
    atl_date >= @start
    AND atl_date <= @end
    AND account_id = @podcast_id
  GROUP BY
    account_id
),
totalPlays AS (
  SELECT
  account_id as podcast_id,
  SUM(aed_playscount) as playscount_total,
  SUM(aed_totaltimelistened) as timelistened_total
  FROM appleEpisodeDetails
  WHERE
    account_id = @podcast_id
    AND aed_date = (SELECT MAX(aed_date) FROM appleEpisodeDetails WHERE account_id = @podcast_id AND aed_date <= @end AND aed_date >= @start)
  GROUP BY
    account_id
),
followers_start AS (
  SELECT
    account_id as podcast_id,
    atf_totalfollowers - atf_totalunfollowers as apple_followers
  FROM
    appleTrendsPodcastFollowers
  WHERE
    atf_date BETWEEN @start AND @end
    AND account_id = @podcast_id
  ORDER BY atf_date ASC
  LIMIT 1
),
followers_end AS (
  SELECT
    account_id as podcast_id,
    atf_totalfollowers - atf_totalunfollowers as apple_followers
  FROM
    appleTrendsPodcastFollowers
  WHERE
    atf_date BETWEEN @start AND @end
    AND account_id = @podcast_id
  ORDER BY atf_date DESC
  LIMIT 1
)
SELECT
  plays.podcast_id,
  apple_playscount,
  apple_totaltimelistened, -- in seconds
  totalPlays.playscount_total as apple_playscount_total,
  totalPlays.timelistened_total as apple_timelistened_total, -- in seconds
  followers_start.apple_followers as apple_followers_start,
  followers_end.apple_followers as apple_followers_end
FROM
  plays 
LEFT JOIN followers_start ON plays.podcast_id = followers_start.podcast_id
LEFT JOIN followers_end ON plays.podcast_id = followers_end.podcast_id
LEFT JOIN totalPlays ON plays.podcast_id = totalPlays.podcast_id;

