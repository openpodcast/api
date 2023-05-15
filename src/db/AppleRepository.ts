import {
    appleEpisodeDetailsPayload,
    AppleEpisodePayload,
    AppleEpisodePlayCountTrendsPayload,
    AppleShowPlayCountTrendsPayload,
    AppleShowTrendsFollowersDay,
    AppleShowTrendsListeningTimeFollowerStateDay,
} from '../types/provider/apple'
import { calcApplePodcastPerformanceQuarters } from '../stats/performance'
class AppleRepository {
    pool

    constructor(pool: any) {
        this.pool = pool
    }

    getTodayDBString(): string {
        const today = new Date()

        // format to YYYY-mm-dd
        // Note that today.toLocaleDateString('en-CA') returned `DD/MM/YYYY` on
        // some systems
        return (
            today.getFullYear() +
            '-' +
            (today.getMonth() + 1) +
            '-' +
            today.getDate()
        )
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
        const calculatedQuarterMedianValues =
            calcApplePodcastPerformanceQuarters(
                episodeDetails.episodePlayHistogram
            )

        const replaceStmt = `REPLACE INTO appleEpisodeDetails (
            account_id,
            episode_id,
            aed_date,
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
            (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`

        return await this.pool.query(replaceStmt, [
            accountId,
            episodeId,
            this.getTodayDBString(),
            episodeDetails.episodePlayCountAllTime.playscount,
            episodeDetails.episodePlayCountAllTime.totaltimelistened,
            episodeDetails.episodePlayCountAllTime.uniqueengagedlistenerscount,
            episodeDetails.episodePlayCountAllTime.uniquelistenerscount,
            episodeDetails.episodePlayCountAllTime.engagedplayscount,
            JSON.stringify(episodeDetails.episodePlayHistogram),
            JSON.stringify(episodeDetails.showTopCities),
            JSON.stringify(episodeDetails.showTopCountries),
            calculatedQuarterMedianValues.maxListeners,
            calculatedQuarterMedianValues.quarterMedianValues[0],
            calculatedQuarterMedianValues.quarterMedianValues[1],
            calculatedQuarterMedianValues.quarterMedianValues[2],
            calculatedQuarterMedianValues.quarterMedianValues[3],
        ])
    }

    storeTrendsPodcastListeningTimeFollowerState(
        accountId: number,
        days: AppleShowTrendsListeningTimeFollowerStateDay[]
    ): void | Promise<any> {
        const replaceStmt = `REPLACE INTO appleTrendsPodcastListeningTimeFollowerState (
            account_id,
            atf_date,
            atf_totaltimelistened_followers,
            atf_totaltimelistened_nonfollowers
            ) VALUES
            (?,STR_TO_DATE(?,'%Y%m%d'),?,?)`

        return Promise.all(
            days.map(
                async (
                    day: AppleShowTrendsListeningTimeFollowerStateDay
                ): Promise<any> =>
                    await this.pool.query(replaceStmt, [
                        accountId,
                        day.date,
                        day.totalListeningTimeFollowed,
                        day.totalListeningTimeNotFollowed,
                    ])
            )
        )
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
