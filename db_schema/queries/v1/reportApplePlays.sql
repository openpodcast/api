SELECT
  account_id as podcast_id,
  atl_date as date,
  atl_playscount as apple_playscount,
  atl_totaltimelistened as apple_totaltimelistened,
  atl_uniqueengagedlistenerscount as apple_uniqueengagedlistenerscount,
  atl_uniquelistenerscount as apple_uniquelistenerscount
FROM
  appleTrendsPodcastListeners
WHERE
  atl_date >= @start
  AND atl_date <= @end
  AND account_id = @podcast_id;