WITH
apple as (
  SELECT 
  atl_date as `date`,
  ep_name as name,
  ep_guid as guid,
  atl_playscount as plays,
  atl_totaltimelistened as total_time_listened,
  atl_uniqueengagedlistenerscount as unique_engaged_listeners,
  atl_uniquelistenerscount as unique_listeners
  FROM appleTrendsEpisodeListeners
  LEFT JOIN appleEpisodeMetadata USING (episode_id)
  WHERE atl_date >= @start AND atl_date <= @end
)

SELECT 
*
FROM apple 