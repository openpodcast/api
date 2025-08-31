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
    SpotifyImpressionsTotalPayload,
    SpotifyImpressionsDailyPayload,
    SpotifyImpressionsFacetedPayload,
    SpotifyImpressionsFunnelPayload,
} from '../../types/provider/spotify'
import aggregateSchema from '../../schema/spotify/aggregate.json'
import detailedStreamsSchema from '../../schema/spotify/detailedStreams.json'
import listenersSchema from '../../schema/spotify/listeners.json'
import performanceSchema from '../../schema/spotify/performance.json'
import podcastMetadataSchema from '../../schema/spotify/podcastMetadata.json'
import episodeMetadataSchema from '../../schema/spotify/episodeMetadata.json'
import followerSchema from '../../schema/spotify/followers.json'
import impressionsTotalSchema from '../../schema/spotify/impressionsTotal.json'
import impressionsDailySchema from '../../schema/spotify/impressionsDaily.json'
import impressionsFacetedSchema from '../../schema/spotify/impressionsFaceted.json'
import impressionsFunnelSchema from '../../schema/spotify/impressionsFunnel.json'
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
            const data = payload.data as any

            // Get date range - use data.start/end if available, otherwise fall back to payload.range
            let startDate: string
            let endDate: string

            if (data.start && data.end) {
                // Normal case: dates are in the data
                startDate = data.start
                endDate = data.end
            } else if (payload.range?.start && payload.range?.end) {
                // Fallback: use dates from payload range
                startDate = payload.range.start
                endDate = payload.range.end
                // Add the missing dates to the data object for schema validation
                data.start = startDate
                data.end = endDate
            } else {
                throw new PayloadError(
                    'Date information is required either in data (start/end) or payload range'
                )
            }

            // Validate the payload (now with start/end dates added if they were missing)
            validateJsonApiPayload(aggregateSchema, data)

            if (payload.meta.episode !== undefined) {
                return await this.repo.storeEpisodeAggregate(
                    accountId,
                    payload.meta.episode,
                    data as SpotifyEpisodeAggregatePayload
                )
            } else {
                return await this.repo.storePodcastAggregate(
                    accountId,
                    data as SpotifyPodcastAggregatePayload
                )
            }
        } else if (payload.meta.endpoint === 'impressions_total') {
            validateJsonApiPayload(impressionsTotalSchema, payload.data)
            return await this.repo.storeImpressionsTotal(
                accountId,
                payload.data as SpotifyImpressionsTotalPayload
            )
        } else if (payload.meta.endpoint === 'impressions_daily') {
            validateJsonApiPayload(impressionsDailySchema, payload.data)
            return await this.repo.storeImpressionsDaily(
                accountId,
                payload.data as SpotifyImpressionsDailyPayload
            )
        } else if (payload.meta.endpoint === 'impressions_faceted') {
            validateJsonApiPayload(impressionsFacetedSchema, payload.data)
            return await this.repo.storeImpressionsFaceted(
                accountId,
                payload.data as SpotifyImpressionsFacetedPayload
            )
        } else if (payload.meta.endpoint === 'impressions_funnel') {
            validateJsonApiPayload(impressionsFunnelSchema, payload.data)
            return await this.repo.storeImpressionsFunnel(
                accountId,
                payload.data as SpotifyImpressionsFunnelPayload
            )
        } else {
            throw new PayloadError(
                `Unknown endpoint in meta: ${payload.meta.endpoint}`
            )
        }
    }
}

export { SpotifyConnector }
