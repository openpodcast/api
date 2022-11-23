import { ConnectorHandler } from '.'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { PayloadError } from '../../types/api'
import episodesSchema from '../../schema/apple/episodes.json'
import episodeDetailsSchema from '../../schema/apple/episodeDetails.json'
import showTrendsListenersSchema from '../../schema/apple/showTrendsListeners.json'
import showTrendsFollowersSchema from '../../schema/apple/showTrendsFollowers.json'
import {
    appleEpisodeDetailsPayload,
    AppleEpisodePayload,
    AppleEpisodePlayCountPayload,
    AppleEpisodePlayCountTrendsPayload,
    AppleEpisodesPayload,
    AppleShowTrendsFollowersDay,
    AppleShowTrendsFollowersPayload,
    AppleShowTrendsListenersPayload,
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
        } else if (payload.meta.endpoint === 'showTrends/Listeners') {
            validateJsonApiPayload(showTrendsListenersSchema, payload.data)

            const payloadData = payload.data as AppleShowTrendsListenersPayload

            // flatten the nested structure to flat episode entries (multiple entries per episode and day)
            // as the AppleEpisodePlayCountTrendsPayload structure contains the episode id we can flatten it
            const episodeEntries: AppleEpisodePlayCountTrendsPayload[] =
                Object.values(payloadData.episodesPlayCountTrends).reduce(
                    (
                        arr: AppleEpisodePlayCountTrendsPayload[],
                        entries: AppleEpisodePlayCountTrendsPayload[]
                    ) => arr.concat(...entries),
                    []
                )

            //stores data per episode and day
            await this.repo.storeTrendsEpisodeListeners(
                accountId,
                episodeEntries
            )

            //stores data per podcast and day
            return await this.repo.storeTrendsPodcastListeners(
                accountId,
                payloadData.showPlayCountTrends
            )
        } else if (payload.meta.endpoint === 'showTrends/Followers') {
            validateJsonApiPayload(showTrendsFollowersSchema, payload.data)

            const payloadData = payload.data as AppleShowTrendsFollowersPayload

            // map all day values into one structure
            let days = payloadData.followerAllTimeTrends.reduce(
                (prev, curr) => {
                    prev[curr[0]] = {
                        date: curr[0],
                        totalListeners: curr[1],
                        gained: 0,
                        lost: 0,
                    } as AppleShowTrendsFollowersDay
                    return prev
                },
                {} as {
                    [day: number]: AppleShowTrendsFollowersDay
                }
            )

            // add gained/lost values
            days = payloadData.followerGrowthTrends.reduce((prev, curr) => {
                const dayElem = prev[curr[0]] || null
                if (dayElem) {
                    dayElem.gained = curr[1]
                    dayElem.lost = curr[1]
                }
                return prev
            }, days)

            //stores data per podcast and day
            return await this.repo.storeTrendsPodcastFollowers(
                accountId,
                Object.values(days)
            )
        }
    }
}

export { AppleConnector }
