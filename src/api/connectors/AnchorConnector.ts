import { ConnectorHandler } from '.'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { PayloadError } from '../../types/api'
import audienceSizeSchema from '../../schema/anchor/audienceSize.json'
import playsSchema from '../../schema/anchor/plays.json'
import playsByAgeRangeSchema from '../../schema/anchor/playsByAgeRange.json'
import playsByAppSchema from '../../schema/anchor/playsByApp.json'
import playsByDeviceSchema from '../../schema/anchor/playsByDevice.json'
import playsByEpisodeSchema from '../../schema/anchor/playsByEpisode.json'
import playsByGenderSchema from '../../schema/anchor/playsByGender.json'
import playsByGeoSchema from '../../schema/anchor/playsByGeo.json'
import totalPlaysSchema from '../../schema/anchor/totalPlays.json'
import totalPlaysByEpisodeSchema from '../../schema/anchor/totalPlaysByEpisode.json'
import uniqueListenersSchema from '../../schema/anchor/uniqueListeners.json'
import aggregatedPerformanceSchema from '../../schema/anchor/aggregatedPerformance.json'

import {
    AnchorAudienceSizeData,
    AnchorConnectorPayload,
    ConnectorPayload,
} from '../../types/connector'
import { AnchorRepository } from '../../db/AnchorRepository'

class AnchorConnector implements ConnectorHandler {
    repo: AnchorRepository

    constructor(repo: AnchorRepository) {
        this.repo = repo
    }

    async handleRequest(
        accountId: number,
        payload: ConnectorPayload
    ): Promise<void> | never {
        // ConnectorPayload is for compatibility with the other connectors
        // AnchorConnectorPayload is the actual payload type for Anchor.
        // We need to convert the ConnectorPayload to AnchorConnectorPayload
        const anchorPayload = payload as AnchorConnectorPayload

        switch (payload.meta.endpoint) {
            case 'audienceSize':
                // The schema ensures that we only have one row
                validateJsonApiPayload(audienceSizeSchema, anchorPayload)

                await this.repo.storeAudienceSizeData(
                    accountId,
                    anchorPayload.data.data as AnchorAudienceSizeData
                )
                break

            // case 'aggregatedPerformance':
            //     // Validate the payload and store data
            //     // Replace 'aggregatedPerformanceSchema' with the actual schema
            //     validateJsonApiPayload(
            //         aggregatedPerformanceSchema,
            //         anchorPayload.data
            //     )
            //     await this.repo.storeAggregatedPerformanceData(
            //         accountId,
            //         anchorPayload.data
            //     )
            //     break

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
                    `Unknown endpoint in meta: ${payload.meta.endpoint}`
                )
        }
    }
}

export { AnchorConnector }
