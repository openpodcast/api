import { ConnectorHandler } from '.'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { PayloadError } from '../../types/api'
import audienceSizeSchema from '../../schema/anchor/audienceSize.json'
import aggregatedPerformanceSchema from '../../schema/anchor/aggregatedPerformance.json'
import episodePerformanceSchema from '../../schema/anchor/episodePerformance.json'
import episodePlaysSchema from '../../schema/anchor/episodePlays.json'
import playsSchema from '../../schema/anchor/plays.json'
import playsByAgeRangeSchema from '../../schema/anchor/playsByAgeRange.json'
import playsByAppSchema from '../../schema/anchor/playsByApp.json'
import playsByDeviceSchema from '../../schema/anchor/playsByDevice.json'
import playsByEpisodeSchema from '../../schema/anchor/playsByEpisode.json'
import playsByGenderSchema from '../../schema/anchor/playsByGender.json'
import playsByGeoSchema from '../../schema/anchor/playsByGeo.json'

import {
    RawAnchorAudienceSizeData,
    AnchorConnectorPayload,
    ConnectorPayload,
    RawAnchorAggregatedPerformanceData,
    RawAnchorEpisodePerformanceData,
    RawAnchorPlaysByEpisodeData,
    RawAnchorPlaysData,
    RawAnchorPlaysByAgeRangeData,
    RawAnchorPlaysByAppData,
    RawAnchorPlaysByDeviceData,
    RawAnchorPlaysByGenderData,
    RawAnchorPlaysByGeoData,
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

                await this.repo.storeAudienceSize(
                    accountId,
                    payload.data.data as RawAnchorAudienceSizeData
                )
                break

            case 'aggregatedPerformance':
                validateJsonApiPayload(aggregatedPerformanceSchema, rawPayload)

                await this.repo.storeAggregatedPerformance(
                    accountId,
                    payload.data.data as RawAnchorAggregatedPerformanceData
                )
                break

            case 'episodePerformance':
                validateJsonApiPayload(episodePerformanceSchema, rawPayload)
                if (payload.meta.episode === undefined) {
                    throw new PayloadError('missing episode id')
                }
                await this.repo.storeEpisodePerformance(
                    accountId,
                    payload.meta.episode,
                    payload.data.data as RawAnchorEpisodePerformanceData
                )
                break

            case 'episodePlays':
                validateJsonApiPayload(episodePlaysSchema, rawPayload)
                if (payload.meta.episode === undefined) {
                    throw new PayloadError('missing episode id')
                }
                await this.repo.storeEpisodePlays(
                    accountId,
                    payload.meta.episode,
                    payload.data.data as RawAnchorPlaysByEpisodeData
                )
                break

            case 'plays':
                validateJsonApiPayload(playsSchema, rawPayload)
                await this.repo.storePlays(
                    accountId,
                    payload.data.data as RawAnchorPlaysData
                )
                break

            case 'playsByAgeRange':
                validateJsonApiPayload(playsByAgeRangeSchema, rawPayload)
                await this.repo.storePlaysByAgeRange(
                    accountId,
                    payload.data.data as RawAnchorPlaysByAgeRangeData
                )
                break

            case 'playsByApp':
                validateJsonApiPayload(playsByAppSchema, rawPayload)
                await this.repo.storePlaysByApp(
                    accountId,
                    payload.data.data as RawAnchorPlaysByAppData
                )
                break

            case 'playsByDevice':
                validateJsonApiPayload(playsByDeviceSchema, rawPayload)
                await this.repo.storePlaysByDevice(
                    accountId,
                    payload.data.data as RawAnchorPlaysByDeviceData
                )
                break

            case 'playsByEpisode':
                validateJsonApiPayload(playsByEpisodeSchema, rawPayload)
                await this.repo.storePlaysByEpisode(
                    accountId,
                    payload.data.data as RawAnchorPlaysByEpisodeData
                )
                break

            case 'playsByGender':
                validateJsonApiPayload(playsByGenderSchema, rawPayload)
                await this.repo.storePlaysByGender(
                    accountId,
                    payload.data.data as RawAnchorPlaysByGenderData
                )
                break

            case 'playsByGeo':
                validateJsonApiPayload(playsByGeoSchema, rawPayload)
                await this.repo.storePlaysByGeo(
                    accountId,
                    payload.data.data as RawAnchorPlaysByGeoData
                )
                break

            default:
                throw new PayloadError(
                    `Unknown endpoint in meta: ${rawPayload.meta.endpoint}`
                )
        }
    }
}

export { AnchorConnector }
