-- This query is called as a fallback in case we don't have any custom template for a podcast
-- In this case, we use the default template and have to query the podcast metadata from the database
SELECT p.pod_name as name,
       spm.spm_artwork_url as artwork_url,
       spm.spm_release_date as release_date,
       spm.spm_url as url,
       spm.spm_publisher as publisher
FROM podcasts p
LEFT JOIN spotifyPodcastMetadata spm ON p.account_id = spm.account_id
WHERE p.account_id = @podcast_id;