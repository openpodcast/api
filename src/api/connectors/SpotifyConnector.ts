import { ConnectorHandler } from '.'
import { PayloadError } from '../../types/api'
import { ConnectorPayload } from '../../types/connector'
import {
    SpotifyDetailedStreamsPayload,
    SpotifyEpisodeMetadataPayload,
    SpotifyPodcastMetadataPayload,
    SpotifyListenersPayload,
    SpotifyPodcastAggregatePayload,
    SpotifyEpisodeAggregatePayload,
    SpotifyPerformancePayload,
    SpotifyPodcastFollowersPayload,
} from '../../types/provider/spotify'
import aggregateSchema from '../../schema/spotify/aggregate.json'
import detailedStreamsSchema from '../../schema/spotify/detailedStreams.json'
import listenersSchema from '../../schema/spotify/listeners.json'
import performanceSchema from '../../schema/spotify/performance.json'
import podcastMetadataSchema from '../../schema/spotify/podcastMetadata.json'
import episodeMetadataSchema from '../../schema/spotify/episodeMetadata.json'
import followerSchema from '../../schema/spotify/followers.json'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { SpotifyRepository } from '../../db/SpotifyRepository'

class SpotifyConnector implements ConnectorHandler {
    repo: SpotifyRepository

    constructor(repo: SpotifyRepository) {
        this.repo = repo
    }

    async handleRequest(
        accountId: number,
        payload: ConnectorPayload
    ): Promise<void> | never {
        if (payload.meta.endpoint === 'metadata') {
            // metadata of podcast
            validateJsonApiPayload(podcastMetadataSchema, payload.data)

            return await this.repo.storePodcastMetadata(
                accountId,
                payload.data as SpotifyPodcastMetadataPayload
            )
        } else if (payload.meta.endpoint === 'detailedStreams') {
            // validates the payload and throws an error if it is not valid
            validateJsonApiPayload(detailedStreamsSchema, payload.data)

            // detailedStreams API has the same format for episodes and podcasts
            // it is distinguished by the presence/absence of the episode id
            if (payload.meta.episode !== undefined) {
                return await this.repo.storeEpisodeDetailedStreams(
                    accountId,
                    payload.meta.episode,
                    payload.data as SpotifyDetailedStreamsPayload
                )
            } else {
                return await this.repo.storePodcastDetailedStreams(
                    accountId,
                    payload.data as SpotifyDetailedStreamsPayload
                )
            }
        } else if (payload.meta.endpoint === 'episodeMetadata') {
            // metadata of single episode
            validateJsonApiPayload(episodeMetadataSchema, payload.data)

            return await this.repo.storeEpisodeMetadata(
                accountId,
                payload.data as SpotifyEpisodeMetadataPayload
            )
        } else if (payload.meta.endpoint === 'followers') {
            // follower count per day
            validateJsonApiPayload(followerSchema, payload.data)

            return await this.repo.storePodcastFollowers(
                accountId,
                payload.data as SpotifyPodcastFollowersPayload
            )
        } else if (payload.meta.endpoint === 'performance') {
            // contains performance data of one single episode
            validateJsonApiPayload(performanceSchema, payload.data)

            if (payload.meta.episode === undefined) {
                throw new PayloadError('missing episode id')
            }

            return await this.repo.storeEpisodePerformance(
                accountId,
                payload.meta.episode,
                payload.data as SpotifyPerformancePayload
            )
        } else if (payload.meta.endpoint === 'listeners') {
            //validates the payload and throws an error if it is not valid
            validateJsonApiPayload(listenersSchema, payload.data)

            if (payload.meta.episode !== undefined) {
                return await this.repo.storeEpisodeListeners(
                    accountId,
                    payload.meta.episode,
                    payload.data as SpotifyListenersPayload
                )
            } else {
                return await this.repo.storePodcastListeners(
                    accountId,
                    payload.data as SpotifyListenersPayload
                )
            }
        } else if (payload.meta.endpoint === 'aggregate') {
            //validates the payload and throws an error if it is not valid
            validateJsonApiPayload(aggregateSchema, payload.data)
            const data = payload.data as SpotifyEpisodeAggregatePayload

            if (payload.meta.episode !== undefined) {
                return await this.repo.storeEpisodeAggregate(
                    accountId,
                    payload.meta.episode,
                    data
                )
            } else {
                return await this.repo.storePodcastAggregate(
                    accountId,
                    data as SpotifyPodcastAggregatePayload
                )
            }
        } else {
            throw new PayloadError(
                `Unknown endpoint in meta: ${payload.meta.endpoint}`
            )
        }
    }
}

export { SpotifyConnector }
