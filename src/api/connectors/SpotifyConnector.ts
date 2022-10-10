import { ConnectorHandler } from '.'
import { PayloadError } from '../../types/api'
import {
    ConnectorPayload,
    SpotifyDetailedStreamsPayload,
    SpotifyListenersPayload,
} from '../../types/connector'
import detailedStreamsSchema from '../../schema/spotify/detailedStreams.json'
import listenersSchema from '../../schema/spotify/listeners.json'
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
        if (payload.meta.endpoint === 'detailedStreams') {
            //validates the payload and throws an error if it is not valid
            validateJsonApiPayload(detailedStreamsSchema, payload.data)
            return await this.repo.storeDetailedStreams(
                accountId,
                payload.data as SpotifyDetailedStreamsPayload
            )
        } else if (payload.meta.endpoint === 'listeners') {
            //validates the payload and throws an error if it is not valid
            validateJsonApiPayload(listenersSchema, payload.data)

            // check if episode id exists in metadata
            if (payload.meta.episode === undefined) {
                throw new PayloadError('missing episode id')
            }

            return await this.repo.storeListeners(
                accountId,
                payload.meta.episode,
                payload.data as SpotifyListenersPayload
            )
        } else {
            throw new PayloadError(
                `Unknown endpoint in meta: ${payload.meta.endpoint}`
            )
        }
    }
}

export { SpotifyConnector }
