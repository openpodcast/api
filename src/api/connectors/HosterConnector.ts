import { ConnectorHandler } from '.'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { PayloadError } from '../../types/api'
import { ConnectorPayload } from '../../types/connector'
import { HosterRepository } from '../../db/HosterRepository'

import hosterEpisodeMetadataSchema from '../../schema/hoster/hosterEpisodeMetadata.json'
import hosterPodcastMetadataSchema from '../../schema/hoster/hosterPodcastMetadata.json'
import hosterEpisodeMetricsSchema from '../../schema/hoster/hosterEpisodeMetrics.json'
import hosterPodcastMetricsSchema from '../../schema/hoster/hosterPodcastMetrics.json'
import {
    HosterEpisodeMetadataPayload,
    HosterPodcastMetadataPayload,
    HosterMetricsPayload,
} from '../../types/provider/hoster'

class HosterConnector implements ConnectorHandler {
    repo: HosterRepository
    hosterId: number

    constructor(repo: HosterRepository, hosterId: number) {
        this.repo = repo
        this.hosterId = hosterId
    }

    async handleRequest(
        accountId: number,
        payload: ConnectorPayload
    ): Promise<void> | never {
        if (payload.meta.endpoint === 'metadata') {
            if (payload.meta.episode) {
                validateJsonApiPayload(
                    hosterEpisodeMetadataSchema,
                    payload.data
                )
                return await this.repo.storeHosterEpisodeMetadata(
                    this.hosterId,
                    accountId,
                    payload.meta.episode,
                    payload.data as HosterEpisodeMetadataPayload
                )
            } else {
                validateJsonApiPayload(
                    hosterPodcastMetadataSchema,
                    payload.data
                )
                return await this.repo.storeHosterPodcastMetadata(
                    this.hosterId,
                    accountId,
                    payload.data as HosterPodcastMetadataPayload
                )
            }
        } else if (payload.meta.endpoint === 'metrics') {
            if (payload.meta.episode) {
                validateJsonApiPayload(hosterEpisodeMetricsSchema, payload.data)
                return await this.repo.storeHosterEpisodeMetrics(
                    this.hosterId,
                    accountId,
                    payload.meta.episode,
                    payload.data as HosterMetricsPayload
                )
            } else {
                validateJsonApiPayload(hosterPodcastMetricsSchema, payload.data)
                return await this.repo.storeHosterPodcastMetrics(
                    this.hosterId,
                    accountId,
                    payload.data as HosterMetricsPayload
                )
            }
        } else {
            throw new PayloadError(
                `Unknown endpoint in meta: ${payload.meta.endpoint}`
            )
        }
    }
}

export { HosterConnector }
