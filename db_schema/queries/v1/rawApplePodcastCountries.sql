SELECT aed_play_top_countries 
FROM appleEpisodeDetails 
WHERE 
  account_id = @podcast_id
  AND aed_date >= @start
  AND aed_date <= @end;