WITH episode_dates AS (
    -- Get the release date of each episode from Spotify metadata
    SELECT 
        em.account_id,
        em.ep_name,
        em.spotify_episode_id,
        em.apple_episode_id,
        s.ep_release_date
    FROM episodeMapping em
    LEFT JOIN spotifyEpisodeMetadata s 
        ON em.account_id = s.account_id 
        AND em.spotify_episode_id = s.episode_id
    WHERE em.account_id = @podcast_id
),
downloads_per_day AS (
    -- Calculate downloads per day since release, up to 6 days after
    SELECT
        ed.account_id,
        ed.ep_name,
        ed.spotify_episode_id,
        ed.apple_episode_id,
        DATEDIFF(COALESCE(sps.sps_date, atl.atl_date), ed.ep_release_date) AS day_since_release,
        COALESCE(sps.sps_streams, 0) AS spotify_downloads,
        COALESCE(atl.atl_playscount, 0) AS apple_downloads,
        COALESCE(sps.sps_streams, 0) + COALESCE(atl.atl_playscount, 0) AS total_downloads
    FROM episode_dates ed
    LEFT JOIN spotifyEpisodeDetailedStreams sps 
        ON ed.account_id = sps.account_id
        AND ed.spotify_episode_id = sps.episode_id
    LEFT JOIN appleTrendsEpisodeListeners atl 
        ON ed.account_id = atl.account_id
        AND ed.apple_episode_id = atl.episode_id
        AND sps.sps_date = atl.atl_date
    WHERE DATEDIFF(COALESCE(sps.sps_date, atl.atl_date), ed.ep_release_date) BETWEEN 0 AND 6
    AND ed.account_id = @podcast_id
),
average_downloads AS (
    -- Calculate the average downloads per day since release
    SELECT 
        account_id,
        day_since_release,
        AVG(spotify_downloads) AS avg_spotify_downloads,
        AVG(apple_downloads) AS avg_apple_downloads,
        AVG(total_downloads) AS avg_total_downloads
    FROM downloads_per_day
    WHERE account_id = @podcast_id
    GROUP BY account_id, day_since_release
),
ranked_episodes AS (
    -- Rank episodes by total downloads per account
    SELECT 
        account_id,
        spotify_episode_id,
        apple_episode_id,
        SUM(total_downloads) AS total_downloads,
        RANK() OVER (PARTITION BY account_id ORDER BY SUM(total_downloads) DESC) AS ep_rank
    FROM downloads_per_day
    WHERE account_id = @podcast_id
    GROUP BY account_id, spotify_episode_id, apple_episode_id
),
top_episodes AS (
    -- Filter to top 10 episodes per account
    SELECT *
    FROM ranked_episodes
    WHERE ep_rank <= 10
)
SELECT 
    dl.account_id,
    ed.ep_name,
    dl.spotify_episode_id,
    dl.apple_episode_id,
    dl.day_since_release,
    dl.spotify_downloads,
    dl.apple_downloads,
    dl.total_downloads,
    ad.avg_spotify_downloads,
    ad.avg_apple_downloads,
    ad.avg_total_downloads
FROM downloads_per_day dl
JOIN top_episodes te 
    ON dl.account_id = te.account_id
    AND dl.spotify_episode_id = te.spotify_episode_id
JOIN average_downloads ad 
    ON dl.account_id = ad.account_id
    AND dl.day_since_release = ad.day_since_release
JOIN episode_dates ed 
    ON dl.account_id = ed.account_id
    AND dl.spotify_episode_id = ed.spotify_episode_id
WHERE dl.account_id = @podcast_id
