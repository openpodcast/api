-- procedure to delete a specifi podcast with account_id
DELIMITER //
CREATE PROCEDURE openpodcast.deletePodcast(IN p_account_id INTEGER)
BEGIN
  -- delete all data for the podcast
  DELETE FROM openpodcast.events WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyPodcastDetailedStreams WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyEpisodeDetailedStreams WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyPodcastListeners WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyPodcastFollowers WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyEpisodeListeners WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyEpisodeAggregate WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyPodcastAggregate WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyEpisodePerformance WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyPodcastMetadata WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyEpisodeMetadata WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyEpisodeMetadataHistory WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleEpisodeMetadata WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleEpisodeDetails WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleTrendsEpisodeListeners WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleTrendsPodcastListeners WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleTrendsPodcastListeningTimeFollowerState WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleTrendsPodcastFollowers WHERE account_id = p_account_id;
  DELETE FROM openpodcast.feedbackVote WHERE account_id = p_account_id;
  DELETE FROM openpodcast.feedbackComment WHERE account_id = p_account_id;
  DELETE FROM openpodcast.updates WHERE account_id = p_account_id;
  
  -- delete the podcast itself
  DELETE FROM openpodcast.podcasts WHERE account_id = p_account_id;

END //
DELIMITER ;