-- @doc
-- Returns all episodes of the podcast with their episode id and the ids on each platform.
-- Use it to map the episodeId of other v2 queries. start and end are ignored.
-- Fields: episodeId, name, releaseDate, spotifyId, appleId, anchorId, podigeeId

SELECT
  e.episode_id AS episodeId,
  MAX(sm.ep_name) AS name,
  MAX(sm.ep_release_date) AS releaseDate,
  MAX(CASE WHEN p.name = 'spotify' THEN ep.platform_episode_id END) AS spotifyId,
  MAX(CASE WHEN p.name = 'apple' THEN ep.platform_episode_id END) AS appleId,
  MAX(CASE WHEN p.name = 'anchor' THEN ep.platform_episode_id END) AS anchorId,
  MAX(CASE WHEN p.name = 'podigee' THEN ep.platform_episode_id END) AS podigeeId
FROM episodes e
JOIN episodePlatformIds ep ON ep.episode_id = e.episode_id
JOIN platforms p ON p.platform_id = ep.platform_id
LEFT JOIN spotifyEpisodeMetadata sm
  ON p.name = 'spotify'
  AND sm.account_id = e.podcast_id
  AND sm.episode_id = ep.platform_episode_id
WHERE e.podcast_id = @podcast_id
GROUP BY e.episode_id
ORDER BY releaseDate DESC, e.episode_id DESC
