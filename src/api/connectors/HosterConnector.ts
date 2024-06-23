import { ConnectorHandler } from '.'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { PayloadError } from '../../types/api'
import hosterPodcastMetadata from '../../schema/hoster/hosterPodcastMetadata.json'

import { ConnectorPayload } from '../../types/connector'
import { HosterPodcastMetadataPayload } from '../../types/provider/hoster'
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
        if (payload.meta.endpoint === 'metadata') {
            console.log('podcastAnalytics')

            // validates the payload and throws an error if it is not valid
            validateJsonApiPayload(hosterPodcastMetadata, payload.data)

            return await this.repo.storeHosterPodcastMetadata(
                accountId,
                payload.data as HosterPodcastMetadataPayload
            )
        } else if (payload.meta.endpoint === 'episodeMetadata') {
            console.log('episodeMetadata')
        } else {
            throw new PayloadError(
                `Unknown endpoint in meta: ${payload.meta.endpoint}`
            )
        }
    }
}

export { HosterConnector }
