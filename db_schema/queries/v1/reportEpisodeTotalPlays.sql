WITH download_subdimensions AS (
    SELECT
        dim_id
    FROM
        subdimensions
    WHERE
        dim_name = 'complete'
    LIMIT 1
),
spotify_streams AS (
    SELECT
        episode_id,
        SUM(sps_streams) AS spotify_plays
    FROM
        spotifyEpisodeDetailedStreams
    WHERE
        sps_date >= @start
        AND sps_date <= @end
        AND account_id = @podcast_id
    GROUP BY
        episode_id
),
apple_streams AS (
    SELECT
        episode_id,
        SUM(atl_playscount) AS apple_plays
    FROM
        appleTrendsEpisodeListeners
    WHERE
        atl_date >= @start
        AND atl_date <= @end
        AND account_id = @podcast_id
    GROUP BY
        episode_id
),
hoster_streams AS (
    SELECT
        episode_id,
        SUM(value) AS hoster_plays
    FROM
        hosterEpisodeMetrics
    WHERE
        start >= @start
        AND end <= @end
        AND start = end -- daily data only
        AND account_id = @podcast_id
        AND dimension = 'downloads'
        AND subdimension = (SELECT dim_id FROM download_subdimensions)
    GROUP BY
        episode_id
)
SELECT 
    E.account_id as podcast_id,
    E.guid,
    S.spotify_plays AS spotify_plays,
    A.apple_plays AS apple_plays,
    H.hoster_plays AS hoster_plays,
    COALESCE(S.spotify_plays, 0) + COALESCE(A.apple_plays, 0) + COALESCE(H.hoster_plays, 0) as total_plays
FROM 
    episodeMapping E
LEFT JOIN 
    spotify_streams S ON E.spotify_episode_id = S.episode_id
LEFT JOIN 
    apple_streams A ON E.apple_episode_id = A.episode_id
LEFT JOIN 
    hoster_streams H ON E.hoster_episode_id = H.episode_id
WHERE E.account_id = @podcast_id;