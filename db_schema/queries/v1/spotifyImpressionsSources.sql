SELECT
	account_id,
	date_start,
	date_end,
	source_id,
	impression_count
FROM
	spotifyImpressionsSources
WHERE
	date_start >= @start
	AND date_end <= @end
	AND account_id = @podcast_id
ORDER BY
	date_start ASC, source_id ASC