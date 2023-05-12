import { ConnectorHandler } from '.'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { PayloadError } from '../../types/api'
import audienceSizeSchema from '../../schema/anchor/audienceSize.json'
import aggregatedPerformanceSchema from '../../schema/anchor/aggregatedPerformance.json'
import episodePerformanceSchema from '../../schema/anchor/episodePerformance.json'

import {
    RawAnchorAudienceSizeData,
    AnchorConnectorPayload,
    ConnectorPayload,
    RawAnchorAggregatedPerformanceData,
    RawAnchorEpisodePerformanceData,
} from '../../types/connector'
import { AnchorRepository } from '../../db/AnchorRepository'

class AnchorConnector implements ConnectorHandler {
    repo: AnchorRepository

    constructor(repo: AnchorRepository) {
        this.repo = repo
    }

    async handleRequest(
        accountId: number,
        rawPayload: ConnectorPayload
    ): Promise<void> | never {
        // ConnectorPayload is for compatibility with the other connectors
        // AnchorConnectorPayload is the actual payload type for Anchor.
        // We need to convert the ConnectorPayload to AnchorConnectorPayload
        const payload = rawPayload as AnchorConnectorPayload

        switch (rawPayload.meta.endpoint) {
            case 'audienceSize':
                // The schema ensures that we only have one row
                validateJsonApiPayload(audienceSizeSchema, rawPayload)

                await this.repo.storeAudienceSizeData(
                    accountId,
                    payload.data.data as RawAnchorAudienceSizeData
                )
                break

            case 'aggregatedPerformance':
                validateJsonApiPayload(aggregatedPerformanceSchema, rawPayload)
                await this.repo.storeAggregatedPerformanceData(
                    accountId,
                    payload.data.data as RawAnchorAggregatedPerformanceData
                )
                break

            case 'episodePerformance':
                validateJsonApiPayload(episodePerformanceSchema, rawPayload)
                if (payload.meta.episode === undefined) {
                    throw new PayloadError('missing episode id')
                }
                await this.repo.storeEpisodePerformanceData(
                    accountId,
                    payload.meta.episode,
                    payload.data.data as RawAnchorEpisodePerformanceData
                )
                break

            // case 'plays':
            //     validateJsonApiPayload(playsSchema, anchorPayload.data)
            //     await this.repo.storePlaysData(accountId, anchorPayload.data)
            //     break

            // case 'playsByAgeRange':
            //     validateJsonApiPayload(
            //         playsByAgeRangeSchema,
            //         anchorPayload.data
            //     )
            //     await this.repo.storePlaysByAgeRangeData(
            //         accountId,
            //         anchorPayload.data
            //     )
            //     break

            // case 'playsByApp':
            //     validateJsonApiPayload(playsByAppSchema, anchorPayload.data)
            //     await this.repo.storePlaysByAppData(
            //         accountId,
            //         anchorPayload.data
            //     )
            //     break

            // case 'playsByDevice':
            //     validateJsonApiPayload(playsByDeviceSchema, anchorPayload.data)
            //     await this.repo.storePlaysByDeviceData(
            //         accountId,
            //         anchorPayload.data
            //     )
            //     break

            // case 'playsByEpisode':
            //     validateJsonApiPayload(playsByEpisodeSchema, anchorPayload.data)
            //     await this.repo.storePlaysByEpisodeData(
            //         accountId,
            //         anchorPayload.data
            //     )
            //     break

            // case 'playsByGender':
            //     validateJsonApiPayload(playsByGenderSchema, anchorPayload.data)
            //     await this.repo.storePlaysByGenderData(
            //         accountId,
            //         anchorPayload.data
            //     )
            //     break

            // case 'playsByGeo':
            //     validateJsonApiPayload(playsByGeoSchema, anchorPayload.data)
            //     await this.repo.storePlaysByGeoData(
            //         accountId,
            //         anchorPayload.data
            //     )
            //     break

            // case 'totalPlays':
            //     validateJsonApiPayload(totalPlaysSchema, anchorPayload.data)
            //     await this.repo.storeTotalPlaysData(
            //         accountId,
            //         anchorPayload.data
            //     )
            //     break

            // case 'totalPlaysByEpisode':
            //     validateJsonApiPayload(
            //         totalPlaysByEpisodeSchema,
            //         anchorPayload.data
            //     )
            //     await this.repo.storeTotalPlaysByEpisodeData(
            //         accountId,
            //         anchorPayload.data
            //     )
            //     break

            // case 'uniqueListeners':
            //     validateJsonApiPayload(
            //         uniqueListenersSchema,
            //         anchorPayload.data
            //     )
            //     await this.repo.storeUniqueListenersData(
            //         accountId,
            //         anchorPayload.data
            //     )
            //     break

            default:
                throw new PayloadError(
                    `Unknown endpoint in meta: ${rawPayload.meta.endpoint}`
                )
        }
    }
}

export { AnchorConnector }
