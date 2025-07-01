WITH
latestValidDate as ( SELECT MAX(date) as d FROM anchorEpisodePerformance WHERE account_id = @podcast_id),  
baseData as (SELECT * FROM anchorEpisodePerformance WHERE date = (SELECT d FROM latestValidDate) AND account_id = @podcast_id)

SELECT
	account_id,
	sec,
	round(avg(JSON_EXTRACT(samples, concat('$."', sec, '"')) / max_listeners) * 100, 2) as average_listener_percent
FROM
	baseData
CROSS JOIN
	 json_table(
	        json_keys(samples)
	        ,
	'$[*]' columns(sec int path '$')
	    ) samples
GROUP BY
	account_id,
	sec
	-- cut off tail of the average values, for which we don't have at least 3 episodes
HAVING
	count(*) > 2