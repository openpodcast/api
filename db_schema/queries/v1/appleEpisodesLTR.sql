SELECT 
  raw_name as name,
  guid,
  `date`,
  quarter1 as apple_quarter1,
  quarter2 as apple_quarter2,
  quarter3 as apple_quarter3,
  quarter4 as apple_quarter4,
  listeners as apple_listeners
FROM appleEpisodesLTR 
WHERE
  `date` >= @start
  AND `date` <= @end
  AND account_id = @podcast_id;