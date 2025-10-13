-- @doc
-- Returns daily Spotify impression metrics showing how many times the podcast appeared in user interfaces.
-- Fields: Account ID, Date, Impressions Count

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