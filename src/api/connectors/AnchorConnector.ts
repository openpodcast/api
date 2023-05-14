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
import podcastEpisodeSchema from '../../schema/anchor/podcastEpisode.json'
import totalPlaysSchema from '../../schema/anchor/totalPlays.json'

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
    RawAnchorPodcastData,
    AnchorDataPayload,
    RawAnchorTotalPlaysData,
} from '../../types/connector'
import { AnchorRepository } from '../../db/AnchorRepository'

// Most Anchor endpoints have a "data" property, which
// is an array of rows and headers.
function isDataPayload(
    data: AnchorConnectorPayload['data']
): data is AnchorDataPayload & { stationId: string } {
    return 'data' in data
}

// The podcast endpoint has a different structure, with a single
// "podcast" property, which is an object.
// It contains the podcastId, and data for each episode.
function isRawAnchorPodcastData(
    data: AnchorConnectorPayload['data']
): data is RawAnchorPodcastData {
    return 'podcastId' in data
}

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

                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }

                await this.repo.storeAudienceSize(
                    accountId,
                    payload.data.data as RawAnchorAudienceSizeData
                )
                break

            case 'aggregatedPerformance':
                validateJsonApiPayload(aggregatedPerformanceSchema, rawPayload)
                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }

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
                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
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
                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }
                await this.repo.storeEpisodePlays(
                    accountId,
                    payload.meta.episode,
                    payload.data.data as RawAnchorPlaysByEpisodeData
                )
                break

            case 'plays':
                validateJsonApiPayload(playsSchema, rawPayload)
                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }
                await this.repo.storePlays(
                    accountId,
                    payload.data.data as RawAnchorPlaysData
                )
                break

            case 'playsByAgeRange':
                validateJsonApiPayload(playsByAgeRangeSchema, rawPayload)
                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }
                await this.repo.storePlaysByAgeRange(
                    accountId,
                    payload.data.data as RawAnchorPlaysByAgeRangeData
                )
                break

            case 'playsByApp':
                validateJsonApiPayload(playsByAppSchema, rawPayload)
                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }
                await this.repo.storePlaysByApp(
                    accountId,
                    payload.data.data as RawAnchorPlaysByAppData
                )
                break

            case 'playsByDevice':
                validateJsonApiPayload(playsByDeviceSchema, rawPayload)
                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }
                await this.repo.storePlaysByDevice(
                    accountId,
                    payload.data.data as RawAnchorPlaysByDeviceData
                )
                break

            case 'playsByEpisode':
                validateJsonApiPayload(playsByEpisodeSchema, rawPayload)
                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }
                await this.repo.storePlaysByEpisode(
                    accountId,
                    payload.data.data as RawAnchorPlaysByEpisodeData
                )
                break

            case 'playsByGender':
                validateJsonApiPayload(playsByGenderSchema, rawPayload)
                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }
                await this.repo.storePlaysByGender(
                    accountId,
                    payload.data.data as RawAnchorPlaysByGenderData
                )
                break

            case 'playsByGeo':
                validateJsonApiPayload(playsByGeoSchema, rawPayload)
                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }
                await this.repo.storePlaysByGeo(
                    accountId,
                    payload.data.data as RawAnchorPlaysByGeoData
                )
                break

            case 'podcastEpisode':
                validateJsonApiPayload(podcastEpisodeSchema, rawPayload)

                if (!isRawAnchorPodcastData(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }
                await this.repo.storePodcastEpisodes(
                    accountId,
                    payload.data.podcastId,
                    payload.data as RawAnchorPodcastData
                )
                break

            case 'totalPlays':
                validateJsonApiPayload(totalPlaysSchema, rawPayload)
                if (!isDataPayload(payload.data)) {
                    throw new PayloadError('Incorrect payload data type')
                }
                await this.repo.storeTotalPlays(
                    accountId,
                    payload.data.data as RawAnchorTotalPlaysData
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
