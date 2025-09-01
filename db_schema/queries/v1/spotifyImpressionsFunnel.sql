-- Gets the latest 30-day funnel data (impressions -> considerations -> streams)
-- Returns data for the most recent period within the requested date range
-- Total impressions are available separately in the spotifyImpressions table
SELECT
	account_id,
	date,
	step_id,
	step_count,
	conversion_percent
FROM
	spotifyImpressionsFunnel
WHERE
	account_id = @podcast_id
	AND date >= @start
	AND date <= @end
ORDER BY
	date DESC, step_id ASC