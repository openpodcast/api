import { ConnectorHandler } from '.'
import { PayloadError } from '../../types/api'
import {
    ConnectorPayload,
    SpotifyDetailedStreamsPayload,
    SpotifyEpisodesMetadataPayload,
    SpotifyListenersPayload,
    SpotifyAggregatePayload,
    SpotifyPerformancePayload,
} from '../../types/connector'
import aggregateSchema from '../../schema/spotify/aggregate.json'
import detailedStreamsSchema from '../../schema/spotify/detailedStreams.json'
import listenersSchema from '../../schema/spotify/listeners.json'
import performanceSchema from '../../schema/spotify/performance.json'
import episodesMetadataSchema from '../../schema/spotify/episodesMetadata.json'
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
        if (payload.meta.endpoint === 'detailedStreams') {
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
        } else if (payload.meta.endpoint === 'episodes') {
            // metadata of multiple episodes
            validateJsonApiPayload(episodesMetadataSchema, payload.data)

            return await this.repo.storeEpisodesMetadata(
                accountId,
                payload.data as SpotifyEpisodesMetadataPayload
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

            // check if episode id exists in metadata
            if (payload.meta.episode === undefined) {
                throw new PayloadError('missing episode id')
            }

            return await this.repo.storeEpisodeAggregate(
                accountId,
                payload.meta.episode,
                payload.range.start,
                payload.data as SpotifyAggregatePayload
            )
        } else {
            throw new PayloadError(
                `Unknown endpoint in meta: ${payload.meta.endpoint}`
            )
        }
    }
}

export { SpotifyConnector }
