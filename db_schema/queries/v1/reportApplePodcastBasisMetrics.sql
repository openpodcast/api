WITH plays AS (
  SELECT
    account_id as podcast_id,
    SUM(atl_playscount) as apple_playscount,
    SUM(atl_totaltimelistened) as apple_totaltimelistened,
    -- TODO: cannot be summed up as it is unique per day and not for the whole period
    SUM(atl_uniqueengagedlistenerscount) as apple_uniqueengagedlistenerscount,
    SUM(atl_uniquelistenerscount) as apple_uniquelistenerscount
  FROM
    appleTrendsPodcastListeners
  WHERE
    atl_date >= @start
    AND atl_date <= @end
    AND account_id = @podcast_id
  GROUP BY
    account_id
),
followers_start AS (
  SELECT
    account_id as podcast_id,
    atf_totalfollowers as apple_followers
  FROM
    appleTrendsPodcastFollowers
  WHERE
    atf_date = @start
    AND account_id = @podcast_id 
),
followers_end AS (
  SELECT
    account_id as podcast_id,
    atf_totalfollowers as apple_followers
  FROM
    appleTrendsPodcastFollowers
  WHERE
    atf_date = @end
    AND account_id = @podcast_id
)
SELECT
  podcast_id,
  apple_playscount,
  apple_totaltimelistened,
  apple_uniqueengagedlistenerscount,
  apple_uniquelistenerscount,
  followers_start.apple_followers as apple_followers_start,
  followers_end.apple_followers as apple_followers_end
FROM
  plays JOIN followers_start USING (podcast_id)
  JOIN followers_end USING (podcast_id)
