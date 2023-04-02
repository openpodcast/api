WITH
apple as (
  SELECT 
  aed_date,
  ep_name as raw_name,
  aed_quarter1_median_listeners/aed_histogram_max_listeners*100 as quarter1,
  aed_quarter2_median_listeners/aed_histogram_max_listeners*100 as quarter2,
  aed_quarter3_median_listeners/aed_histogram_max_listeners*100 as quarter3,
  aed_quarter4_median_listeners/aed_histogram_max_listeners*100 as quarter4,
  aed_histogram_max_listeners as listeners,
  ep_guid as guid
  FROM appleEpisodeDetails
  LEFT JOIN appleEpisodeMetadata USING (episode_id)
  WHERE
  aed_date >= @start
  AND aed_date <= @end
  AND appleEpisodeDetails.account_id = @podcast_id 
)

SELECT 
apple.raw_name as name,
guid,
aed_date as `date`,
apple.quarter1 as apple_quarter1,
apple.quarter2 as apple_quarter2,
apple.quarter3 as apple_quarter3,
apple.quarter4 as apple_quarter4,
apple.listeners as apple_listeners
FROM apple 