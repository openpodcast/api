select
	account_id,
	sps_date as `date`,
	sps_starts as spotify_starts,
	sps_streams as spotify_streams
from
	spotifyPodcastDetailedStreams
WHERE
	sps_date >= @start
	AND sps_date <= @end
	AND account_id = @podcast_id
