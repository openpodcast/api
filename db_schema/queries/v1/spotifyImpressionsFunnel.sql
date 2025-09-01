-- Gets the latest 30-day funnel data (impressions -> considerations -> streams)
-- Returns data for the most recent day within the requested date range

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