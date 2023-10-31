import { ConnectorHandler } from '.'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { PayloadError } from '../../types/api'
import podcastDetailsSchema from '../../schema/podigee/podcastDetails.json'

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
import { PodigeeRepository } from '../../db/PodigeeRepository'

class PodigeeConnector implements ConnectorHandler {
    repo: PodigeeRepository

    constructor(repo: PodigeeRepository) {
        this.repo = repo
    }

    async handleRequest(
        accountId: number,
        payload: ConnectorPayload
    ): Promise<void> | never {
        if (payload.meta.endpoint === 'analytics') {
            // validates the payload and throws an error if it is not valid
            validateJsonApiPayload(analyticsSchema, payload.data)

            return await this.repo.storeEpisodesMetadata(
                accountId,
                Object.values(
                    (payload.data as PodigeePodcastAnalyticsPayload).content
                        .results
                ) as AppleEpisodePayload[]
            )
        } else {
            throw new PayloadError(
                `Unknown endpoint in meta: ${payload.meta.endpoint}`
            )
        }
    }
}

export default { PodigeeConnector }
