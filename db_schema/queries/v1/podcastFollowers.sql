SELECT * FROM podcastFollowers 
WHERE
  account_id = @podcast_id
  AND date >= @start
  AND date <= @end
