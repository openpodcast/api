-- procedure to delete a specific podcast with account_id

DROP PROCEDURE IF EXISTS openpodcast.deletePodcast;

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
  DELETE FROM openpodcast.spotifyImpressions WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyImpressionsDaily WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyImpressionsSources WHERE account_id = p_account_id;
  DELETE FROM openpodcast.spotifyImpressionsFunnel WHERE account_id = p_account_id;
  DELETE FROM openpodcast.podcastMetadata WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleEpisodeMetadata WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleEpisodeDetails WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleTrendsEpisodeListeners WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleTrendsPodcastListeners WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleTrendsPodcastListeningTimeFollowerState WHERE account_id = p_account_id;
  DELETE FROM openpodcast.appleTrendsPodcastFollowers WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorEpisodesPage WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorAudienceSize WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorAggregatedPerformance WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorEpisodePerformance WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorPlays WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorEpisodePlays WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorPlaysByAgeRange WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorPlaysByApp WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorPlaysByDevice WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorPlaysByGender WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorPlaysByGeo WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorPlaysByGeoCity WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorPodcastEpisodes WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorTotalPlays WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorTotalPlaysByEpisode WHERE account_id = p_account_id;
  DELETE FROM openpodcast.anchorUniqueListeners WHERE account_id = p_account_id;
  DELETE FROM openpodcast.hosterPodcastMetadata WHERE account_id = p_account_id;
  DELETE FROM openpodcast.hosterPodcastMetrics WHERE account_id = p_account_id;
  DELETE FROM openpodcast.hosterEpisodeMetadata WHERE account_id = p_account_id;
  DELETE FROM openpodcast.hosterEpisodeMetrics WHERE account_id = p_account_id;
  DELETE FROM openpodcast.feedbackVote WHERE account_id = p_account_id;
  DELETE FROM openpodcast.feedbackComment WHERE account_id = p_account_id;
  DELETE FROM openpodcast.updates WHERE account_id = p_account_id;
  
  -- delete auth data from openpodcast_auth schema
  DELETE FROM openpodcast_auth.podcastSources WHERE account_id = p_account_id;
  -- only delete API keys that are exclusively associated with this account
  DELETE ak1 FROM openpodcast_auth.apiKeys ak1
  WHERE ak1.account_id = p_account_id 
    AND NOT EXISTS (
      SELECT 1 FROM openpodcast_auth.apiKeys ak2 
      WHERE ak2.key_hash = ak1.key_hash 
        AND ak2.account_id != p_account_id
    );
  
  -- delete the podcast itself
  DELETE FROM openpodcast.podcasts WHERE account_id = p_account_id;

END //
DELIMITER ;