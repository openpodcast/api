import {
    RawAnchorAudienceSizeData,
    RawAnchorAggregatedPerformanceData,
    convertToAnchorAggregatedPerformanceData,
    RawAnchorEpisodePerformanceData,
    RawAnchorPlaysByEpisodeData,
    convertToAnchorEpisodePlaysData,
    RawAnchorPlaysData,
    convertToAnchorPlaysData,
    RawAnchorPlaysByAgeRangeData,
    convertToAnchorPlaysByAgeRangeData,
    RawAnchorPlaysByAppData,
    RawAnchorPlaysByDeviceData,
    RawAnchorPlaysByGenderData,
    RawAnchorPlaysByGeoData,
    RawAnchorPodcastData,
    RawAnchorTotalPlaysData,
    RawAnchorTotalPlaysByEpisodeData,
    RawAnchorUniqueListenersData,
} from '../types/provider/anchor'

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

    getDateDBString(date: Date): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1)
        const day = String(date.getDate())

        return `${year}-${month}-${day}`
    }

    async storeAudienceSize(
        accountId: number,
        data: RawAnchorAudienceSizeData
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

    async storeAggregatedPerformance(
        accountId: number,
        data: RawAnchorAggregatedPerformanceData
    ): Promise<any> {
        // This conversion is done here instead of in the connector because of
        // https://eslint.org/docs/latest/rules/no-case-declarations
        const anchorAggregatedPerformanceData =
            convertToAnchorAggregatedPerformanceData(data)

        const replaceStmt = `REPLACE INTO anchorAggregatedPerformance (
            account_id,
            aap_date,
            aap_percentile25,
            aap_percentile50,
            aap_percentile75,
            aap_percentile100,
            aap_average_listen_seconds
            ) VALUES
            (?,?,?,?,?,?,?)`

        return await this.pool.query(replaceStmt, [
            accountId,
            this.getTodayDBString(),
            anchorAggregatedPerformanceData.percentile25,
            anchorAggregatedPerformanceData.percentile50,
            anchorAggregatedPerformanceData.percentile75,
            anchorAggregatedPerformanceData.percentile100,
            anchorAggregatedPerformanceData.averageListenSeconds,
        ])
    }

    async storeEpisodePerformance(
        accountId: number,
        episodeId: string,
        data: RawAnchorEpisodePerformanceData
    ): Promise<any> {
        // Iterate over rows, convert to number, and store in the database
        // Data format: "rows": [[0,"13"],...]
        const replaceStmt = `REPLACE INTO anchorEpisodePerformance (   
            account_id,
            aep_episode_id,
            aep_date,
            aep_sample,
            aep_listeners
            ) VALUES
            (?,?,?,?,?)`

        // This is probably not the most efficient way to do this.
        // We could probably do a single query with multiple rows?
        return await Promise.all(
            data.rows.map(
                async (entry: any): Promise<any> =>
                    await this.pool.query(replaceStmt, [
                        accountId,
                        episodeId,
                        this.getTodayDBString(),
                        entry[0] as number,
                        entry[1] as number,
                    ])
            )
        )
    }

    async storeEpisodePlays(
        accountId: number,
        episodeId: string,
        data: RawAnchorPlaysByEpisodeData
    ): Promise<any> {
        const anchorEpisodePlaysData = convertToAnchorEpisodePlaysData(data)

        const replaceStmt = `REPLACE INTO anchorEpisodePlays (
          account_id,
          aep_episode_id,
          aep_date,
          aep_plays
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        anchorEpisodePlaysData.data.forEach((plays, date) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                episodeId,
                this.getDateDBString(date),
                plays,
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    async storePlays(
        accountId: number,
        data: RawAnchorPlaysData
    ): Promise<any> {
        const anchorPlaysData = convertToAnchorPlaysData(data)

        const replaceStmt = `REPLACE INTO anchorPlays (
          account_id,
          aep_date,
          aep_plays
        ) VALUES (?,?,?)`

        const queryPromises: Promise<any>[] = []

        anchorPlaysData.data.forEach((plays, date) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                this.getDateDBString(date),
                plays,
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    async storePlaysByAgeRange(
        accountId: number,
        data: RawAnchorPlaysByAgeRangeData
    ): Promise<any> {
        const anchorPlaysByAgeRangeData =
            convertToAnchorPlaysByAgeRangeData(data)

        const replaceStmt = `REPLACE INTO anchorPlaysByAgeRange (
            account_id,
            apbar_date,
            apbar_age_range,
            apbar_plays_percent
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        anchorPlaysByAgeRangeData.data.forEach((plays, ageRange) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                this.getTodayDBString(),
                ageRange,
                plays,
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    async storePlaysByApp(
        accountId: number,
        data: RawAnchorPlaysByAppData
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO anchorPlaysByApp (
            account_id,
            apba_date,
            apba_app,
            apba_plays_percent
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                this.getTodayDBString(),
                entry[0],
                entry[1],
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    async storePlaysByDevice(
        accountId: number,
        data: RawAnchorPlaysByDeviceData
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO anchorPlaysByDevice (
            account_id,
            apbd_date,
            apbd_device,
            apbd_plays_percent
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                this.getTodayDBString(),
                entry[0],
                entry[1],
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    async storePlaysByEpisode(
        accountId: number,
        data: RawAnchorPlaysByEpisodeData
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO anchorPlaysByEpisode (
            account_id,
            apbe_date,
            apbe_episode_id,
            apbe_plays
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                this.getTodayDBString(),
                entry[0],
                entry[1],
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    storePlaysByGender = async (
        accountId: number,
        data: RawAnchorPlaysByGenderData
    ): Promise<any> => {
        const replaceStmt = `REPLACE INTO anchorPlaysByGender (
            account_id,
            apbg_date,
            apbg_gender,
            apbg_plays_percent
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                this.getTodayDBString(),
                entry[0],
                entry[1],
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    async storePlaysByGeo(
        accountId: number,
        data: RawAnchorPlaysByGeoData
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO anchorPlaysByGeo (
            account_id,
            apbg_date,
            apbg_geo,
            apbg_plays_percent
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                this.getTodayDBString(),
                entry[0],
                entry[1],
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    async storePodcastEpisodes(
        accountId: number,
        podcastId: string,
        data: RawAnchorPodcastData
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO anchorPodcastEpisodes (
            account_id,
            ape_podcast_id,
            ape_episode_id,
            ape_date,
            ape_title,
            ape_description,
            ape_url,
            ape_tracked_url,
            ape_episode_image,
            ape_share_link_path,
            ape_share_link_embed_path,
            ape_ad_count,
            ape_created,
            ape_duration,
            ape_hour_offset,
            ape_is_deleted,
            ape_is_published
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.podcastEpisodes.forEach((episode) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                podcastId,
                episode.podcastEpisodeId,
                this.getTodayDBString(),
                episode.title,
                episode.description,
                episode.url,
                episode.trackedUrl,
                episode.episodeImage,
                episode.shareLinkPath,
                episode.shareLinkEmbedPath,
                episode.adCount,
                new Date(episode.createdUnixTimestamp * 1000),
                episode.duration,
                episode.hourOffset,
                episode.isDeleted,
                episode.isPublished,
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    async storeTotalPlays(
        accountId: number,
        data: RawAnchorTotalPlaysData
    ): Promise<any> {
        // totalPlays.rows is an array with a single element
        const totalPlays = data.rows[0]

        const replaceStmt = `REPLACE INTO anchorTotalPlays (
            account_id,
            atp_date,
            atp_plays
        ) VALUES (?,?,?)`

        const queryPromise = this.pool.query(replaceStmt, [
            accountId,
            this.getTodayDBString(),
            totalPlays,
        ])

        return queryPromise
    }

    async storeTotalPlaysByEpisode(
        accountId: number,
        data: RawAnchorTotalPlaysByEpisodeData
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO anchorTotalPlaysByEpisode (
            account_id,
            atpbe_date,
            atpbe_episode_id,
            atpbe_plays
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                this.getTodayDBString(),
                entry[0],
                entry[1],
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    async storeUniqueListeners(
        accountId: number,
        data: RawAnchorUniqueListenersData
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO anchorUniqueListeners (
            account_id,
            aul_date,
            aul_unique_listeners
        ) VALUES (?,?,?)`

        const queryPromise = this.pool.query(replaceStmt, [
            accountId,
            this.getTodayDBString(),
            data.rows[0],
        ])

        return queryPromise
    }
}

export { AnchorRepository }
