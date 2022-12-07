import {
    appleEpisodeDetailsPayload,
    AppleEpisodePayload,
    AppleEpisodePlayCountTrendsPayload,
    AppleShowPlayCountTrendsPayload,
    AppleShowTrendsFollowersDay,
} from '../types/connector'
import { calcApplePodcastPerformanceQuarters } from '../stats/performance'
import { HealthCheckInterface } from './HealthCheckInterface'
class AppleRepository implements HealthCheckInterface {
    pool

    constructor(pool: any) {
        this.pool = pool
    }

    async healthy(): Promise<boolean> {
        const statement = 'SELECT count(*) as c from applePodcastMetadata2'
        try {
            const result = await this.pool.query(statement)
            console.log(result)
            return result !== undefined
        } catch (e) {
            return false
        }
    }

    // store metadata of multiple episodes
    async storeEpisodesMetadata(
        accountId: number,
        episodes: AppleEpisodePayload[]
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO appleEpisodeMetadata (
            account_id,
            episode_id,
            ep_name,
            ep_collection_name,
            ep_release_datetime,
            ep_release_date,
            ep_guid,
            ep_number,
            ep_type         
            ) VALUES
            (?,?,?,?,STR_TO_DATE(?, '%Y-%m-%dT%TZ'),?,?,?,?)`

        return await Promise.all(
            episodes.map(
                async (entry: AppleEpisodePayload): Promise<any> =>
                    await this.pool.query(replaceStmt, [
                        accountId,
                        entry.id,
                        entry.name,
                        entry.collectionName,
                        entry.releaseDateTime,
                        entry.releaseDate,
                        entry.podcastEpisodeGuid,
                        entry.podcastEpisodeNumber,
                        entry.podcastEpisodeType,
                    ])
            )
        )
    }

    async storeEpisodeDetails(
        accountId: number,
        episodeId: string,
        episodeDetails: appleEpisodeDetailsPayload
    ): Promise<any> {
        const calculataedQauerterMedianValues =
            calcApplePodcastPerformanceQuarters(
                episodeDetails.episodePlayHistogram
            )

        const replaceStmt = `REPLACE INTO appleEpisodeDetails (
            account_id,
            episode_id,
            aed_playscount,
            aed_totaltimelistened,
            aed_uniqueengagedlistenerscount,
            aed_uniquelistenerscount,
            aed_engagedplayscount,            
            aed_play_histogram,
            aed_play_top_cities,
            aed_play_top_countries,
            aed_histogram_max_listeners,
            aed_quarter1_median_listeners,
            aed_quarter2_median_listeners,
            aed_quarter3_median_listeners,
            aed_quarter4_median_listeners
            ) VALUES
            (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`

        return await this.pool.query(replaceStmt, [
            accountId,
            episodeId,
            episodeDetails.episodePlayCountAllTime.playscount,
            episodeDetails.episodePlayCountAllTime.totaltimelistened,
            episodeDetails.episodePlayCountAllTime.uniqueengagedlistenerscount,
            episodeDetails.episodePlayCountAllTime.uniquelistenerscount,
            episodeDetails.episodePlayCountAllTime.engagedplayscount,
            JSON.stringify(episodeDetails.episodePlayHistogram),
            JSON.stringify(episodeDetails.showTopCities),
            JSON.stringify(episodeDetails.showTopCountries),
            calculataedQauerterMedianValues.maxListeners,
            calculataedQauerterMedianValues.quarterMedianValues[0],
            calculataedQauerterMedianValues.quarterMedianValues[1],
            calculataedQauerterMedianValues.quarterMedianValues[2],
            calculataedQauerterMedianValues.quarterMedianValues[3],
        ])
    }

    async storeTrendsEpisodeListeners(
        accountId: number,
        data: AppleEpisodePlayCountTrendsPayload[]
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO appleTrendsEpisodeListeners (
            account_id,
            episode_id,
            atl_date,
            atl_playscount,
            atl_totaltimelistened,
            atl_uniqueengagedlistenerscount,
            atl_uniquelistenerscount
            ) VALUES
            (?,?,STR_TO_DATE(?,'%Y%m%d'),?,?,?,?)`

        return await Promise.all(
            data.map(
                async (
                    entry: AppleEpisodePlayCountTrendsPayload
                ): Promise<any> =>
                    await this.pool.query(replaceStmt, [
                        accountId,
                        entry.episodeid,
                        entry.timebucket,
                        entry.playscount,
                        entry.totaltimelistened,
                        entry.uniqueengagedlistenerscount,
                        entry.uniquelistenerscount,
                    ])
            )
        )
    }

    async storeTrendsPodcastListeners(
        accountId: number,
        data: AppleShowPlayCountTrendsPayload[]
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO appleTrendsPodcastListeners (
            account_id,
            atl_date,
            atl_playscount,
            atl_totaltimelistened,
            atl_uniqueengagedlistenerscount,
            atl_uniquelistenerscount
            ) VALUES
            (?,STR_TO_DATE(?,'%Y%m%d'),?,?,?,?)`

        return await Promise.all(
            data.map(
                async (entry: AppleShowPlayCountTrendsPayload): Promise<any> =>
                    await this.pool.query(replaceStmt, [
                        accountId,
                        entry.timebucket,
                        entry.playscount,
                        entry.totaltimelistened,
                        entry.uniqueengagedlistenerscount,
                        entry.uniquelistenerscount,
                    ])
            )
        )
    }

    async storeTrendsPodcastFollowers(
        accountId: number,
        data: AppleShowTrendsFollowersDay[]
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO appleTrendsPodcastFollowers (
            account_id,
            atf_date,
            atf_totalfollowers,
            atf_gained,
            atf_lost
            ) VALUES
            (?,STR_TO_DATE(?,'%Y%m%d'),?,?,?)`

        return await Promise.all(
            data.map(
                async (entry: AppleShowTrendsFollowersDay): Promise<any> =>
                    await this.pool.query(replaceStmt, [
                        accountId,
                        entry.date,
                        entry.totalListeners,
                        entry.gained,
                        entry.lost,
                    ])
            )
        )
    }
}

export { AppleRepository }
