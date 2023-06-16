WITH last_date AS (
  SELECT MAX(date) AS date
  FROM podcastFollowers
  WHERE account_id = @podcast_id
)
SELECT * FROM podcastFollowers 
WHERE
  date = (SELECT date FROM last_date)
  AND account_id = @podcast_id;
