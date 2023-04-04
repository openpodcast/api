SELECT 
  atf_date as `date`,
  atf_totalfollowers as total_followers,
  atf_gained as gained_followers,
  atf_lost as lost_followers
FROM appleTrendsPodcastFollowers
WHERE
  atf_date >= @start
  AND atf_date <= @end
  AND account_id = @podcast_id