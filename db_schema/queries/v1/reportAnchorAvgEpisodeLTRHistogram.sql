WITH latestValidDate as ( SELECT MAX(date) FROM anchorEpisodePerformance WHERE account_id = @podcast_id)  
SELECT
	account_id,
	sec,
	round(avg(JSON_EXTRACT(samples, concat('$."', sec, '"')) / max_listeners) * 100, 2) as average_listener_percent
FROM
	anchorEpisodePerformance
CROSS JOIN
	 json_table(
	        json_keys(samples)
	        ,
	'$[*]' columns(sec int path '$')
	    ) samples
WHERE
	date = (
	SELECT
		date
	FROM
		latestValidDate)
	and account_id = @podcast_id
GROUP BY
	account_id,
	sec
	-- cut off tail of the average values, for which we don't have at least 3 episodes
HAVING
	count(*) > 2
