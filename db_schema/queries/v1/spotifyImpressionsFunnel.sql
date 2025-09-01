-- Gets the latest 30-day funnel data (impressions -> considerations -> streams)
-- Returns data for the most recent period within the requested date range
-- Each row includes the total impressions for reference
SELECT
	account_id,
	date,
	step_id,
	step_count,
	conversion_percent,
	(SELECT step_count 
	 FROM spotifyImpressionsFunnel sif2 
	 WHERE sif2.account_id = spotifyImpressionsFunnel.account_id 
	   AND sif2.date = spotifyImpressionsFunnel.date 
	   AND sif2.step_id = 'impressions') as total_impressions
FROM
	spotifyImpressionsFunnel
WHERE
	account_id = @podcast_id
	AND date >= @start
	AND date <= @end
ORDER BY
	date DESC, step_id ASC