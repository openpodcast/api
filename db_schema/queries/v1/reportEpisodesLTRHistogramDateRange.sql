-- LTR Histogram with date-range filtered download counts instead of lifetime max listeners
-- Returns Apple/Spotify/Podigee downloads summed over the report date range
-- Still includes LTR histograms from the latest available data within the range

WITH
-- Find latest available dates within the report range for histogram data
maxSpotifyDate as (SELECT MAX(spp_date) as d FROM spotifyEpisodePerformance WHERE account_id = @podcast_id AND spp_date <= @end AND spp_date >= @start),
maxAppleDate as (SELECT MAX(aed_date) as d FROM appleEpisodeDetails WHERE account_id = @podcast_id AND aed_date <= @end AND aed_date >= @start),

-- Get Podigee download subdimension
download_subdimensions AS (
    SELECT dim_id, dim_name
    FROM subdimensions
    WHERE dim_name = 'complete'
    LIMIT 1
),

-- Sum Spotify streams over the date range
spotifyDateRangeStreams AS (
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
appleDateRangePlays AS (
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
podigeeDateRangeDownloads AS (
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
),

-- Normalize Spotify LTR to 15sec buckets (same as original query)
spotifyEpisodePerformance15SecBuckets as (
    SELECT JSON_ARRAYAGG(JSON_OBJECT(sample_id-1,listeners)) as histogram,episode_id,account_id,spp_date,spp_sample_max FROM
        spotifyEpisodePerformance CROSS JOIN
        JSON_TABLE(
            spp_samples,
            "$[*]"
            COLUMNS (
              sample_id FOR ORDINALITY,
              listeners INT PATH "$"
            )
        ) samples
    WHERE
        -- just show numbers every 15 seconds and the first+last one
        (MOD(sample_id-1,15) = 0 OR sample_id = 1 OR spp_sample_seconds = sample_id)
        AND account_id = @podcast_id
        AND spp_date = (SELECT d FROM maxSpotifyDate)
    GROUP BY account_id,episode_id,spp_sample_max,spp_date
)

SELECT
    guid,
    meta.ep_name,
    spotify.spp_date as histogram_date,
    ep_release_date,

    -- Date-range totals instead of max listeners
    COALESCE(spotifyDateRange.spotify_total_streams, 0) as spotify_total_streams,
    COALESCE(appleDateRange.apple_total_plays, 0) as apple_total_plays,
    COALESCE(podigeeRange.podigee_total_downloads, 0) as podigee_total_downloads,

    -- Keep histogram data for LTR analysis
    spotify.histogram as spotify_histogram,
    aed_play_histogram as apple_histogram,
    spp_sample_max as spotify_listeners_max,
    aed_histogram_max_listeners as apple_listeners_max

FROM
    episodeMapping
    LEFT JOIN spotifyEpisodePerformance15SecBuckets as spotify ON spotify.episode_id = episodeMapping.spotify_episode_id AND spotify.account_id = @podcast_id
    LEFT JOIN appleEpisodeDetails as apple ON apple.episode_id = episodeMapping.apple_episode_id AND apple.account_id = @podcast_id AND apple.aed_date = (SELECT d FROM maxAppleDate)
    LEFT JOIN spotifyEpisodeMetadata as meta ON meta.episode_id = episodeMapping.spotify_episode_id AND meta.account_id = @podcast_id
    LEFT JOIN spotifyDateRangeStreams as spotifyDateRange ON spotifyDateRange.account_id = @podcast_id
    LEFT JOIN appleDateRangePlays as appleDateRange ON appleDateRange.account_id = @podcast_id
    LEFT JOIN podigeeDateRangeDownloads as podigeeRange ON podigeeRange.account_id = @podcast_id
WHERE
    episodeMapping.account_id = @podcast_id
    -- Only include episodes released during or before the report period
    AND ep_release_date <= @end
ORDER BY
    ep_release_date DESC