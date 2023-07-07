import { ConnectorHandler } from '.'
import { validateJsonApiPayload } from '../JsonPayloadValidator'
import { PayloadError } from '../../types/api'
import episodesSchema from '../../schema/apple/episodes.json'
import episodeDetailsSchema from '../../schema/apple/episodeDetails.json'
import showTrendsListenersSchema from '../../schema/apple/showTrendsListeners.json'
import showTrendsFollowersSchema from '../../schema/apple/showTrendsFollowers.json'
import showTrendsListeningTimeFollowerState from '../../schema/apple/showTrendsListeningTimeFollowerState.json'
import { ConnectorPayload } from '../../types/connector'
import {
    appleEpisodeDetailsPayload,
    AppleEpisodePayload,
    AppleEpisodePlayCountTrendsPayload,
    AppleEpisodesPayload,
    AppleShowTrendsFollowersDay,
    AppleShowTrendsFollowersPayload,
    AppleShowTrendsListenersPayload,
    AppleShowTrendsListeningTimeFollowerStatePayload,
    AppleShowTrendsListeningTimeFollowerStateDay,
} from '../../types/provider/apple'
import { AppleRepository } from '../../db/AppleRepository'
import moment from 'moment'

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
            let followerData = payloadData.followerAllTimeTrends.reduce(
                (prev, curr) => {
                    // use moment to get date from YYYYMMDD format
                    const day = curr[0].toString()
                    const totalFollowers = curr[1]
                    const totalUnfollowers = curr[2]
                    prev[day] = {
                        date: day,
                        totalFollowers: totalFollowers,
                        totalUnfollowers: totalUnfollowers,
                        gained: 0,
                        lost: 0,
                    } as AppleShowTrendsFollowersDay
                    return prev
                },
                {} as {
                    [day: string]: AppleShowTrendsFollowersDay
                }
            )

            // add gained/lost values
            followerData = payloadData.followerGrowthTrends.reduce(
                (prev, curr) => {
                    // as gained/lost is the difference between the date and the next date
                    // we want to store it together with the next day
                    const nextDay = moment(curr[0].toString(), 'YYYYMMDD')
                        .add(1, 'days')
                        .format('YYYYMMDD')
                    // if next day present, add gained/lost values
                    if (prev[nextDay]) {
                        prev[nextDay].gained = curr[1]
                        prev[nextDay].lost = curr[2]
                    }
                    return prev
                },
                followerData
            )

            //stores data per podcast and day
            return await this.repo.storeTrendsPodcastFollowers(
                accountId,
                Object.values(followerData)
            )
        } else if (
            payload.meta.endpoint === 'showTrends/ListeningTimeFollowerState'
        ) {
            validateJsonApiPayload(
                showTrendsListeningTimeFollowerState,
                payload.data
            )

            const payloadData =
                payload.data as AppleShowTrendsListeningTimeFollowerStatePayload

            // map all followers to days
            let days =
                payloadData.timeListenedByFollowStateFollowedTrends.reduce(
                    (prev, curr) => {
                        prev[curr[0]] = {
                            date: curr[0],
                            totalListeningTimeFollowed: curr[1],
                            totalListeningTimeNotFollowed: 0,
                        } as AppleShowTrendsListeningTimeFollowerStateDay
                        return prev
                    },
                    {} as {
                        [
                            day: number
                        ]: AppleShowTrendsListeningTimeFollowerStateDay
                    }
                )

            //map non followers
            days =
                payloadData.timeListenedByFollowStateNotFollowedTrends.reduce(
                    (prev, curr) => {
                        //if the value is zero, the entry is not provided by apple
                        //so let's create zero values in case the day wasn't created yet
                        if (!prev[curr[0]]) {
                            prev[curr[0]] = {
                                date: curr[0],
                                totalListeningTimeFollowed: 0,
                                totalListeningTimeNotFollowed: 0,
                            } as AppleShowTrendsListeningTimeFollowerStateDay
                        }
                        prev[curr[0]].totalListeningTimeNotFollowed = curr[1]
                        return prev
                    },
                    days
                )

            const daysList = Object.values(days)

            //in case no data is available we just skip it
            if (daysList.length === 0) {
                return
            }

            //store listening time of podcast grouped by follower state
            return await this.repo.storeTrendsPodcastListeningTimeFollowerState(
                accountId,
                daysList
            )
        } else {
            throw new PayloadError(
                `Unknown endpoint in meta: ${payload.meta.endpoint}`
            )
        }
    }
}

export { AppleConnector }
