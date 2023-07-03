SELECT
    podcast_id,
    episode_id,
    `date`,
    title,
    description,
    episode_image,
    url,
    tracked_url,
    share_link_path,
    share_link_embed_path,
    created,
    duration,
    publishOn
FROM
    anchorPodcastEpisodes
WHERE
    is_published = 1
    AND is_deleted = 0
    AND account_id = @podcast_id
ORDER BY
    created DESC