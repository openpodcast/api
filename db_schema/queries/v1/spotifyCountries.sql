WITH
data as (
SELECT 
    SUM(spa_gender_male+spa_gender_female+spa_gender_not_specified+spa_gender_non_binary) as spotify_listeners, 
    spa_facet as spotify_country_shortcode
FROM spotifyPodcastAggregate
WHERE 
    spa_facet_type="country" 
    AND spa_date >= @start
    AND spa_date <= @end
    AND account_id = @podcast_id
GROUP BY spa_facet
)

SELECT
*,
ROUND(spotify_listeners/(SUM(spotify_listeners) OVER())*100, 2) as spotify_listeners_percent
FROM data