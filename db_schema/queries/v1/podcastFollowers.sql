SELECT * FROM podcastFollowers 
WHERE
  date >= @start
  AND date <= @end
  AND account_id = @podcast_id;
