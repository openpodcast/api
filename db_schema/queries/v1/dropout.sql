SELECT
raw_name,
((spotify.quarter1*spotify.listeners)+(apple.quarter1*apple.listeners))/(spotify.listeners+apple.listeners) as quarter1,
((spotify.quarter2*spotify.listeners)+(apple.quarter2*apple.listeners))/(spotify.listeners+apple.listeners) as quarter2,
((spotify.quarter3*spotify.listeners)+(apple.quarter3*apple.listeners))/(spotify.listeners+apple.listeners) as quarter3,
((spotify.quarter4*spotify.listeners)+(apple.quarter4*apple.listeners))/(spotify.listeners+apple.listeners) as quarter4,
((spotify.dropFirst2Third*CAST(spotify.listeners as SIGNED))+(apple.dropFirst2Third*CAST(apple.listeners as SIGNED)))/(spotify.listeners+apple.listeners) as dropFirst2Third,

ABS((CAST (spotify.quarter1 as SIGNED)-CAST (apple.quarter1 as SIGNED)
+CAST (spotify.quarter2 as SIGNED)-CAST (apple.quarter2 as SIGNED)
+CAST (spotify.quarter3 as SIGNED)-CAST (apple.quarter3 as SIGNED)
+CAST (spotify.quarter4 as SIGNED)-CAST (apple.quarter4 as SIGNED))/4) as SpotifyVsApple,


spotify.listeners+apple.listeners as listeners,
spotify.name as name
FROM 

(SELECT 
ep_name as raw_name,
`spotifyEpisodePerformance`.`spp_percentile_25` as quarter1, 
`spotifyEpisodePerformance`.`spp_percentile_50` as quarter2, 
`spotifyEpisodePerformance`.`spp_percentile_75` as quarter3, 
`spotifyEpisodePerformance`.`spp_percentile_100` as quarter4,
CAST(`spotifyEpisodePerformance`.`spp_percentile_75` AS SIGNED) - CAST(`spotifyEpisodePerformance`.`spp_percentile_25` AS SIGNED) as dropFirst2Third,
spp_sample_max as listeners,
CONCAT(ep_name, " (", ep_release_date, ")") as name
FROM `spotifyEpisodePerformance`
LEFT JOIN `spotifyEpisodeMetadata` `SpotifyEpisodeMetadata` ON `spotifyEpisodePerformance`.`episode_id` = `SpotifyEpisodeMetadata`.`episode_id`
WHERE `spotifyEpisodePerformance`.account_id=2) as spotify

JOIN

(SELECT 
appleEpisodeMetadata.episode_id,
aed_quarter1_median_listeners/aed_histogram_max_listeners*100 as quarter1,
aed_quarter2_median_listeners/aed_histogram_max_listeners*100 as quarter2,
aed_quarter3_median_listeners/aed_histogram_max_listeners*100 as quarter3,
aed_quarter4_median_listeners/aed_histogram_max_listeners*100 as quarter4,
(aed_quarter3_median_listeners/aed_histogram_max_listeners*100)-(aed_quarter1_median_listeners/aed_histogram_max_listeners*100) as dropFirst2Third,
aed_histogram_max_listeners as listeners,
CONCAT(ep_name, " (", ep_release_date, ")") as name
FROM appleEpisodeDetails
LEFT JOIN appleEpisodeMetadata USING (episode_id)
WHERE appleEpisodeDetails.account_id=2) as apple

ON spotify.name = apple.name