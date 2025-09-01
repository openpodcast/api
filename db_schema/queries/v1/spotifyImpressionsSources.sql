-- Gets impressions breakdown by source (HOME, SEARCH, LIBRARY, OTHER)
-- Returns data for the most recent 30-day period only
SELECT
	account_id,
	date_start,
	date_end,
	source_id,
	impression_count
FROM
	spotifyImpressionsSources
WHERE
	account_id = @podcast_id
	AND date_start = (
		-- Find the most recent 30-day period available
		SELECT MAX(date_start) 
		FROM spotifyImpressionsSources 
		WHERE account_id = @podcast_id
	)
ORDER BY
	source_id ASC