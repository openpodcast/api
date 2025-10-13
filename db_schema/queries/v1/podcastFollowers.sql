-- @doc
-- Returns podcast follower metrics across platforms showing daily follower counts and growth trends.
-- Fields: Date, Platform, Followers Count, Growth metrics

SELECT * FROM podcastFollowers 
WHERE
  account_id = @podcast_id
  AND date >= @start
  AND date <= @end
