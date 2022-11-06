import { ConnectorHandler } from '.'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { PayloadError } from '../../types/api'
import episodesSchema from '../../schema/apple/episodes.json'
import episodeDetailsSchema from '../../schema/apple/episodeDetails.json'
import {
    appleEpisodeDetailsPayload,
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

            // this payload contains two completely different data trees
            // metadata and global play counts of episodes
            // as play counts is already covered by the episodeDetails API we can skip it here

            return await this.repo.storeEpisodesMetadata(
                accountId,
                Object.values(
                    (payload.data as AppleEpisodesPayload).content.results
                ) as AppleEpisodePayload[]
            )
        } else if (payload.meta.endpoint === 'episodeDetails') {
            validateJsonApiPayload(episodeDetailsSchema, payload.data)

            if (payload.meta.episode === undefined) {
                throw new PayloadError('missing episode id')
            }

            return await this.repo.storeEpisodeDetails(
                accountId,
                payload.meta.episode,
                payload.data as appleEpisodeDetailsPayload
            )
        }
    }
}

export { AppleConnector }
