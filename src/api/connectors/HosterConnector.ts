import { ConnectorHandler } from '.'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { PayloadError } from '../../types/api'
import hosterSchema from '../../schema/hoster/hoster.json'

import { ConnectorPayload } from '../../types/connector'
import {
    RawAnchorAudienceSizeData,
    AnchorConnectorPayload,
    RawAnchorAggregatedPerformanceData,
    RawAnchorEpisodePerformanceData,
    RawAnchorPlaysByEpisodeData,
    RawAnchorPlaysData,
    RawAnchorPlaysByAgeRangeData,
    RawAnchorPlaysByAppData,
    RawAnchorPlaysByDeviceData,
    RawAnchorPlaysByGenderData,
    RawAnchorPlaysByGeoData,
    RawAnchorPodcastData,
    AnchorDataPayload,
    RawAnchorTotalPlaysData,
    RawAnchorTotalPlaysByEpisodeData,
    RawAnchorUniqueListenersData,
    RawAnchorEpisodesPageData,
} from '../../types/provider/anchor'
import { isArray } from 'mathjs'
import { HosterRepository } from '../../db/HosterRepository'

class HosterConnector implements ConnectorHandler {
    repo: HosterRepository

    constructor(repo: HosterRepository) {
        this.repo = repo
    }

    async handleRequest(
        accountId: number,
        payload: ConnectorPayload
    ): Promise<void> | never {
        if (payload.meta.endpoint === 'podcastAnalytics') {
            console.log('podcastAnalytics')

            f (payload.meta.endpoint === 'hoster') {

            // validates the payload and throws an error if it is not valid
            validateJsonApiPayload(hosterSchema, payload.data)

            return await this.repo.storeEpisodesMetadata(
                accountId,
                Object.values(
                    (payload.data as HosterPodcastAnalyticsPayload).content
                        .results
                ) as AppleEpisodePayload[]
            )
        } else if (payload.meta.endpoint === 'episodeAnalytics') {
            console.log('episodeAnalytics')
        } else {
            throw new PayloadError(
                `Unknown endpoint in meta: ${payload.meta.endpoint}`
            )
        }
    }
}

export { HosterConnector }
