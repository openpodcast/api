-- This query is called as a fallback in case we don't have any custom template for a podcast
-- In this case, we use the default template and have to query the podcast metadata from the database
SELECT pod_name
FROM podcasts 
WHERE account_id = @podcast_id
