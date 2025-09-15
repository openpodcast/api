-- Simple platform download totals for date range
-- Returns Apple plays, Spotify streams, and Podigee downloads summed over the report period

WITH
-- Get Podigee download subdimension
download_subdimensions AS (
    SELECT dim_id
    FROM subdimensions
    WHERE dim_name = 'complete'
    LIMIT 1
),

-- Sum Spotify streams over the date range
spotify_totals AS (
    SELECT
        account_id,
        SUM(sps_streams) as spotify_total_streams
    FROM spotifyPodcastDetailedStreams
    WHERE account_id = @podcast_id
        AND sps_date >= @start
        AND sps_date <= @end
    GROUP BY account_id
),

-- Sum Apple plays over the date range
apple_totals AS (
    SELECT
        account_id,
        SUM(atl_playscount) as apple_total_plays
    FROM appleTrendsPodcastListeners
    WHERE account_id = @podcast_id
        AND atl_date >= @start
        AND atl_date <= @end
    GROUP BY account_id
),

-- Sum Podigee downloads over the date range
podigee_totals AS (
    SELECT
        account_id,
        SUM(value) as podigee_total_downloads
    FROM hosterPodcastMetrics
    WHERE account_id = @podcast_id
        AND dimension = 'downloads'
        AND subdimension = (SELECT dim_id FROM download_subdimensions)
        AND start >= @start
        AND end <= @end
    GROUP BY account_id
)

SELECT
    @podcast_id as podcast_id,
    COALESCE(spotify.spotify_total_streams, 0) as spotify_total_streams,
    COALESCE(apple.apple_total_plays, 0) as apple_total_plays,
    COALESCE(podigee.podigee_total_downloads, 0) as podigee_total_downloads
FROM
    (SELECT @podcast_id as account_id) base
    LEFT JOIN spotify_totals spotify ON spotify.account_id = base.account_id
    LEFT JOIN apple_totals apple ON apple.account_id = base.account_id
    LEFT JOIN podigee_totals podigee ON podigee.account_id = base.account_id