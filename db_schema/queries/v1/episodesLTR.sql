WITH
spotify as (
  SELECT 
  spp_date,
  ep_name as raw_name,
  `spotifyEpisodePerformance`.`spp_percentile_25` as quarter1, 
  `spotifyEpisodePerformance`.`spp_percentile_50` as quarter2, 
  `spotifyEpisodePerformance`.`spp_percentile_75` as quarter3, 
  `spotifyEpisodePerformance`.`spp_percentile_100` as quarter4,
  spp_sample_max as listeners
  FROM spotifyEpisodePerformance
  LEFT JOIN spotifyEpisodeMetadata USING (account_id,episode_id)
  WHERE
  spp_date >= @start
  AND spp_date <= @end
  AND spotifyEpisodePerformance.account_id = @podcast_id
  AND spotifyEpisodeMetadata.account_id = @podcast_id
),
apple as (
  SELECT * 
  FROM appleEpisodesLTR
  WHERE
    date >= @start
    AND date <= @end
    AND account_id = @podcast_id 
)
-- no merge hint because the long merged query takes ages
-- no_merge executes both queries separately and then
-- executes the final one on the intermediate results
SELECT /*+ NO_MERGE(spotify)  NO_MERGE(apple) */
  apple.raw_name as name,
  guid,
  apple.date as `date`,
  ((spotify.quarter1*spotify.listeners)+(apple.quarter1*apple.listeners))/(spotify.listeners+apple.listeners) as quarter1_combined,
  ((spotify.quarter2*spotify.listeners)+(apple.quarter2*apple.listeners))/(spotify.listeners+apple.listeners) as quarter2_combined,
  ((spotify.quarter3*spotify.listeners)+(apple.quarter3*apple.listeners))/(spotify.listeners+apple.listeners) as quarter3_combined,
  ((spotify.quarter4*spotify.listeners)+(apple.quarter4*apple.listeners))/(spotify.listeners+apple.listeners) as quarter4_combined,
  spotify.quarter1 as spotify_quarter1,
  spotify.quarter2 as spotify_quarter2,
  spotify.quarter3 as spotify_quarter3,
  spotify.quarter4 as spotify_quarter4,
  apple.quarter1 as apple_quarter1,
  apple.quarter2 as apple_quarter2,
  apple.quarter3 as apple_quarter3,
  apple.quarter4 as apple_quarter4,
  spotify.listeners+apple.listeners as listeners_combined,
  apple.listeners as apple_listeners,
  spotify.listeners as spotify_listeners
FROM spotify JOIN apple ON (spotify.raw_name = apple.raw_name AND apple.date=spp_date)
-- make sure we have data from spotify and apple
WHERE apple.quarter1 IS NOT NULL AND spotify.quarter1 IS NOT NULL