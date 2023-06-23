SELECT
	account_id,
	spm_date as `date`,
	spm_starts as spotify_starts,
	spm_streams as spotify_streams,
	spm_listeners as spotify_listeners,
	spm_followers as spotify_followers
FROM
	spotifyPodcastMetadata
WHERE
	spm_date >= @start
	AND spm_date <= @end
	AND account_id = @podcast_id
GROUP BY
	account_id,
	spm_date,
	spm_starts,
	spm_streams,
	spm_listeners,
	spm_followers