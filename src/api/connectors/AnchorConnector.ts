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
import playsByGeoCitySchema from '../../schema/anchor/playsByGeoCity.json'
import podcastEpisodeSchema from '../../schema/anchor/podcastEpisode.json'
import totalPlaysSchema from '../../schema/anchor/totalPlays.json'
import totalPlaysByEpisodeSchema from '../../schema/anchor/totalPlaysByEpisode.json'
import uniqueListenersSchema from '../../schema/anchor/uniqueListeners.json'

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
} from '../../types/provider/anchor'
import { AnchorRepository } from '../../db/AnchorRepository'
import { isArray } from 'mathjs'

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
        const endpoint = rawPayload.meta.endpoint

        if (endpoint === undefined) {
            throw new PayloadError('missing endpoint')
        }

        // ConnectorPayload is for compatibility with the other connectors
        // AnchorConnectorPayload is the actual payload type for Anchor.
        // We need to convert the ConnectorPayload to AnchorConnectorPayload
        const payload = rawPayload as AnchorConnectorPayload

        if (endpoint == 'audienceSize') {
            // The schema ensures that we only have one row
            validateJsonApiPayload(audienceSizeSchema, rawPayload)

            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }

            await this.repo.storeAudienceSize(
                accountId,
                payload.data.data as RawAnchorAudienceSizeData
            )
        } else if (endpoint == 'aggregatedPerformance') {
            validateJsonApiPayload(aggregatedPerformanceSchema, rawPayload)
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }

            await this.repo.storeAggregatedPerformance(
                accountId,
                payload.data.data as RawAnchorAggregatedPerformanceData
            )
        } else if (endpoint == 'episodePerformance') {
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
        } else if (endpoint == 'episodePlays') {
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
        } else if (endpoint == 'plays') {
            validateJsonApiPayload(playsSchema, rawPayload)
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }
            await this.repo.storePlays(
                accountId,
                payload.data.data as RawAnchorPlaysData
            )
        } else if (endpoint == 'playsByAgeRange') {
            validateJsonApiPayload(playsByAgeRangeSchema, rawPayload)
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }
            await this.repo.storePlaysByAgeRange(
                accountId,
                payload.data.data as RawAnchorPlaysByAgeRangeData
            )
        } else if (endpoint == 'playsByApp') {
            validateJsonApiPayload(playsByAppSchema, rawPayload)
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }
            await this.repo.storePlaysByApp(
                accountId,
                payload.data.data as RawAnchorPlaysByAppData
            )
        } else if (endpoint == 'playsByDevice') {
            validateJsonApiPayload(playsByDeviceSchema, rawPayload)
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }
            await this.repo.storePlaysByDevice(
                accountId,
                payload.data.data as RawAnchorPlaysByDeviceData
            )
        } else if (endpoint == 'playsByEpisode') {
            validateJsonApiPayload(playsByEpisodeSchema, rawPayload)
            if (payload.meta.episode === undefined) {
                throw new PayloadError('missing episode id')
            }
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }
            await this.repo.storePlaysByEpisode(
                accountId,
                payload.meta.episode,
                payload.data.data as RawAnchorPlaysByEpisodeData
            )
        } else if (endpoint == 'playsByGender') {
            validateJsonApiPayload(playsByGenderSchema, rawPayload)
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }
            await this.repo.storePlaysByGender(
                accountId,
                payload.data.data as RawAnchorPlaysByGenderData
            )
        } else if (endpoint == 'playsByGeo') {
            validateJsonApiPayload(playsByGeoSchema, rawPayload)
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }
            await this.repo.storePlaysByGeo(
                accountId,
                payload.data.data as RawAnchorPlaysByGeoData
            )
        } else if (endpoint == 'playsByGeoCity') {
            validateJsonApiPayload(playsByGeoCitySchema, rawPayload)
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }

            // The schema ensures that we have a "geos" array,
            // where the second element is the country code
            const countryPayload = payload.data as AnchorDataPayload
            if (countryPayload.kind !== 'playsByGeo') {
                throw new PayloadError(
                    `Incorrect payload data type: ${countryPayload}`
                )
            }
            const geoParams = countryPayload.parameters
            if (isArray(geoParams) || geoParams.geos.length < 2) {
                throw new PayloadError(`Incorrect geo parameters: ${geoParams}`)
            }
            const country = countryPayload.parameters.geos[1]

            await this.repo.storePlaysByGeoCity(
                accountId,
                country,
                payload.data.data as RawAnchorPlaysByGeoData
            )
        } else if (endpoint == 'podcastEpisode') {
            validateJsonApiPayload(podcastEpisodeSchema, rawPayload)

            if (!isRawAnchorPodcastData(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }
            await this.repo.storePodcastEpisodes(
                accountId,
                payload.data.podcastId,
                payload.data as RawAnchorPodcastData
            )
        } else if (endpoint == 'totalPlays') {
            validateJsonApiPayload(totalPlaysSchema, rawPayload)
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }
            await this.repo.storeTotalPlays(
                accountId,
                payload.data.data as RawAnchorTotalPlaysData
            )
        } else if (endpoint == 'totalPlaysByEpisode') {
            validateJsonApiPayload(totalPlaysByEpisodeSchema, rawPayload)
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }
            await this.repo.storeTotalPlaysByEpisode(
                accountId,
                payload.data.data as RawAnchorTotalPlaysByEpisodeData
            )
        } else if (endpoint == 'uniqueListeners') {
            validateJsonApiPayload(uniqueListenersSchema, rawPayload)
            if (!isDataPayload(payload.data)) {
                throw new PayloadError('Incorrect payload data type')
            }
            await this.repo.storeUniqueListeners(
                accountId,
                payload.data.data as RawAnchorUniqueListenersData
            )
        } else {
            throw new PayloadError(
                `Unknown endpoint in meta: ${rawPayload.meta.endpoint}`
            )
        }
    }
}

export { AnchorConnector }
