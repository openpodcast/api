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
  account_id;