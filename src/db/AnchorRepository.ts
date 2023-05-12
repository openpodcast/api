import {
    AnchorDataPayload,
    ConnectorPayload,
    AnchorEpisodePlaysData,
    AnchorPlaysData,
    AnchorAggregatedPerformanceData,
    AnchorAudienceSizeData,
    AnchorPlaysByAgeRangeData,
    AnchorPlaysByAppData,
    AnchorPlaysByDeviceData,
    AnchorPlaysByGenderData,
    AnchorPlaysByGeoData,
    AnchorTotalPlaysData,
    AnchorTotalPlaysByEpisodeData,
    AnchorUniqueListenersData,
} from '../types/connector'
// import { calcAnchorPodcastPerformanceQuarters } from '../stats/performance'

class AnchorRepository {
    pool

    constructor(pool: any) {
        this.pool = pool
    }

    getTodayDBString(): string {
        const today = new Date()

        return (
            today.getFullYear() +
            '-' +
            (today.getMonth() + 1) +
            '-' +
            today.getDate()
        )
    }

    async storeAudienceSizeData(
        accountId: number,
        data: AnchorAudienceSizeData
    ): Promise<any> {
        // audienceSize.rows is an array with a single element
        const audienceSize = data.rows[0]

        const replaceStmt = `REPLACE INTO anchorAudienceSize (
            account_id,
            aas_date,
            aas_audience_size
            ) VALUES
            (?,?,?)`

        return await this.pool.query(replaceStmt, [
            accountId,
            this.getTodayDBString(),
            audienceSize,
        ])
    }

    // async storeEpisodesMetadata(
    //     accountId: number,
    //     episodes: ConnectorPayload[]
    // ): Promise<any> {
    //     const replaceStmt = `REPLACE INTO anchorEpisodeMetadata (
    //         account_id,
    //         episode_id,
    //         ep_name,
    //         ep_collection_name,
    //         ep_release_datetime,
    //         ep_release_date,
    //         ep_guid,
    //         ep_number,
    //         ep_type
    //         ) VALUES
    //         (?,?,?,?,STR_TO_DATE(?, '%Y-%m-%dT%TZ'),?,?,?,?)`

    //     return await Promise.all(
    //         episodes.map(
    //             async (entry: ConnectorPayload): Promise<any> =>
    //                 await this.pool.query(replaceStmt, [
    //                     accountId,
    //                     entry.meta.episode,
    //                     entry.data.ep_name,
    //                     entry.data.ep_collection_name,
    //                     entry.data.ep_release_datetime,
    //                     entry.data.ep_release_date,
    //                     entry.data.ep_guid,
    //                     entry.data.ep_number,
    //                     entry.data.ep_type,
    //                 ])
    //         )
    //     )
    // }

    // async storeEpisodeDetails(
    //     accountId: number,
    //     episodeId: string,
    //     episodeDetails: AnchorDataPayload
    // ): Promise<any> {
    //     const calculatedQuarterMedianValues =
    //         calcAnchorPodcastPerformanceQuarters(
    //             episodeDetails.data.episodePlayHistogram
    //         )

    //     const replaceStmt = `REPLACE INTO anchorEpisodeDetails (
    //         account_id,
    //         episode_id,
    //         aed_date,
    //         aed_playscount,
    //         aed_totaltimelistened,
    //         aed_uniqueengagedlistenerscount,
    //         aed_uniquelistenerscount,
    //         aed_engagedplayscount,
    //         aed_play_histogram,
    //         aed_play_top_cities,
    //         aed_play_top_countries,
    //         aed_histogram_max_listeners,
    //         aed_quarter1_median_listeners,
    //         aed_quarter2_median_listeners,
    //         aed_quarter3_median_listeners,
    //         aed_quarter4_median_listeners
    //         ) VALUES
    //         (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`

    //     return await this.pool.query(replaceStmt, [
    //         accountId,
    //         episodeId,
    //         this.getTodayDBString(),
    //         episodeDetails.data.aed_playscount,
    //         episodeDetails.data.aed_totaltimelistened,
    //         episodeDetails.data.aed_uniqueengagedlistenerscount,
    //         episodeDetails.data.aed_uniquelistenerscount,
    //         episodeDetails.data.aed_engagedplayscount,
    //         JSON.stringify(episodeDetails.data.aed_play_histogram),
    //         JSON.stringify(episodeDetails.data.aed_play_top_cities),
    //         JSON.stringify(episodeDetails.data.aed_play_top_countries),
    //         calculatedQuarterMedianValues.maxListeners,
    //         calculatedQuarterMedianValues.quarterMedianValues[0],
    //         calculatedQuarterMedianValues.quarterMedianValues[1],
    //         calculatedQuarterMedianValues.quarterMedianValues[2],
    //         calculatedQuarterMedianValues.quarterMedianValues[3],
    //     ])
    // }

    // // ...remaining methods from the previous response

    // async storeTrendsPodcastFollowers(
    //     accountId: number,
    //     data: AnchorAudienceSizeData[]
    // ): Promise<any> {
    //     const replaceStmt = `REPLACE INTO anchorTrendsPodcastFollowers (
    //         account_id,
    //         atf_date,
    //         atf_totalfollowers,
    //         atf_gained,
    //         atf_lost
    //         ) VALUES
    //         (?,STR_TO_DATE(?,'%Y%m%d'),?,?,?)`

    //     return await Promise.all(
    //         data.map(
    //             async (entry: AnchorAudienceSizeData): Promise<any> =>
    //                 await this.pool.query(replaceStmt, [
    //                     accountId,
    //                     entry.date,
    //                     entry.totalListeners,
    //                     entry.gained,
    //                     entry.lost,
    //                 ])
    //         )
    //     )
    // }
}

export { AnchorRepository }
