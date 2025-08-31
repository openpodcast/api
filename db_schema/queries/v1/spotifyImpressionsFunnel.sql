SELECT
	account_id,
	date,
	step_id,
	step_count,
	conversion_percent
FROM
	spotifyImpressionsFunnel
WHERE
	date >= @start
	AND date <= @end
	AND account_id = @podcast_id
ORDER BY
	date ASC, step_id ASC