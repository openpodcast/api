-- @doc
-- Returns Spotify conversion funnel data showing the progression from impressions to considerations to streams with conversion rates.
-- Fields: Account ID, Date, Step ID, Step Count, Conversion Percentage

SELECT DISTINCT 
	account_id,
	FIRST_VALUE(date) OVER (
		PARTITION BY step_id 
		ORDER BY date DESC
	) AS date,
	step_id,
	FIRST_VALUE(step_count) OVER (
		PARTITION BY step_id 
		ORDER BY date DESC
	) AS step_count,
	FIRST_VALUE(conversion_percent) OVER (
		PARTITION BY step_id 
		ORDER BY date DESC
	) AS conversion_percent
FROM spotifyImpressionsFunnel
WHERE account_id = @podcast_id
	AND date >= @start 
	AND date <= @end 
ORDER BY step_id ASC;