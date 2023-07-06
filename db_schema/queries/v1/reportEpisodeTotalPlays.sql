WITH spotify_streams AS (
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
)
SELECT 
	E.account_id as podcast_id,
    E.guid,
    S.spotify_plays AS spotify_plays,
    A.apple_plays AS apple_plays,
    S.spotify_plays + A.apple_plays as total_plays
FROM 
    episodeMapping E
JOIN 
    spotify_streams S ON E.spotify_episode_id = S.episode_id
JOIN 
    apple_streams A ON E.apple_episode_id = A.episode_id
WHERE E.account_id = @podcast_id;