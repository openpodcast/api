SELECT 
  atf_date as `date`,
  atf_totalfollowers as apple_total_followers,
  spf_count as spotify_total_followers
FROM appleTrendsPodcastFollowers as apple JOIN spotifyPodcastFollowers as spotify
ON (atf_date = spf_date AND apple.account_id = spotify.account_id)
WHERE
  atf_date >= @start
  AND atf_date <= @end
  AND account_id = @podcast_id;
