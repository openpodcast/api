SELECT
	account_id,
	date,
	impressions
FROM
	spotifyImpressionsDaily
WHERE
	date >= @start
	AND date <= @end
	AND account_id = @podcast_id
ORDER BY
	date ASC