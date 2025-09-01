-- Gets impressions breakdown by source (HOME, SEARCH, LIBRARY, OTHER)
-- Returns data for the most recent 30-day period within the requested date range
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
	AND date_start >= @start
	AND date_start <= @end
ORDER BY
	date_start DESC, source_id ASC