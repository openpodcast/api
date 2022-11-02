import { ConnectorHandler } from '.'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { PayloadError } from '../../types/api'
import episodesSchema from '../../schema/apple/episodes.json'
import {
    AppleEpisodePayload,
    AppleEpisodePlayCountPayload,
    AppleEpisodesPayload,
    ConnectorPayload,
} from '../../types/connector'
import { AppleRepository } from '../../db/AppleRepository'

class AppleConnector implements ConnectorHandler {
    repo: AppleRepository

    constructor(repo: AppleRepository) {
        this.repo = repo
    }

    async handleRequest(
        accountId: number,
        payload: ConnectorPayload
    ): Promise<void> | never {
        if (payload.meta.endpoint === 'episodes') {
            // validates the payload and throws an error if it is not valid
            validateJsonApiPayload(episodesSchema, payload.data)

            // as this payload contains two completely different data trees
            // we separate metadata and global play counts of episodes

            await this.repo.storeEpisodesMetadata(
                accountId,
                Object.values(
                    (payload.data as AppleEpisodesPayload).content.results
                ) as AppleEpisodePayload[]
            )

            return await this.repo.storeEpisodesPlayCount(
                accountId,
                Object.values(
                    (payload.data as AppleEpisodesPayload).episodesPlayCount
                ) as AppleEpisodePlayCountPayload[][]
            )
        }
    }
}

export { AppleConnector }
