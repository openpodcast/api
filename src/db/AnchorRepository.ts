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

const getDateDBString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1)
    const day = String(date.getDate())

    return `${year}-${month}-${day}`
}

const getTodayDBString = (): string => {
    return getDateDBString(new Date())
}

// Convert unix timestamp in seconds or milliseconds to Date string in
// format YYYY-MM-DD
const getDateFromTimestamp = (timestamp: number | string): string => {
    // Convert milliseconds to seconds if necessary
    if (timestamp.toString().length === 13) {
        timestamp = Number(timestamp) / 1000
    }
    const date = new Date(Number(timestamp) * 1000)
    return getDateDBString(date)
}

class AnchorRepository {
    pool

    constructor(pool: any) {
        this.pool = pool
    }

    async storeAudienceSize(
        accountId: number,
        data: RawAnchorAudienceSizeData
    ): Promise<any> {
        // audienceSize.rows is an array with a single element
        const audienceSize = data.rows[0]

        const replaceStmt = `REPLACE INTO anchorAudienceSize (
            account_id,
            date,
            audience_size
            ) VALUES
            (?,?,?)`

        return await this.pool.query(replaceStmt, [
            accountId,
            getTodayDBString(),
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
            date,
            percentile25,
            percentile50,
            percentile75,
            percentile100,
            average_listen_seconds
            ) VALUES
            (?,?,?,?,?,?,?)`

        return await this.pool.query(replaceStmt, [
            accountId,
            getTodayDBString(),
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
            episode_id,
            date,
            max_listeners,
            samples 
            ) VALUES (?,?,?,?,?)`

        let maxListeners = 0

        const secondsMap = data.rows.reduce((acc, entry) => {
            const listeners = Number(entry[1])
            const seconds = Number(entry[0])
            maxListeners = Math.max(maxListeners, listeners)
            acc[seconds] = listeners
            return acc
        }, {} as Record<number, number>)

        return await this.pool.query(replaceStmt, [
            accountId,
            episodeId,
            getTodayDBString(),
            maxListeners,
            JSON.stringify(secondsMap),
        ])
    }

    async storeEpisodePlays(
        accountId: number,
        episodeId: string,
        data: RawAnchorPlaysByEpisodeData
    ): Promise<any> {
        const anchorEpisodePlaysData = convertToAnchorEpisodePlaysData(data)

        const replaceStmt = `REPLACE INTO anchorEpisodePlays (
          account_id,
          episode_id,
          date,
          plays
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        anchorEpisodePlaysData.data.forEach((plays, date) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                episodeId,
                getDateDBString(date),
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
          date,
          plays
        ) VALUES (?,?,?)`

        const queryPromises: Promise<any>[] = []

        anchorPlaysData.data.forEach((plays, date) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                getDateDBString(date),
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
            date,
            age_range,
            plays_percent
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        anchorPlaysByAgeRangeData.data.forEach((plays, ageRange) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                getTodayDBString(),
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
            date,
            app,
            plays_percent
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                getTodayDBString(),
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
            date,
            device,
            plays_percent
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                getTodayDBString(),
                entry[0],
                entry[1],
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    async storePlaysByEpisode(
        accountId: number,
        episodeId: string,
        data: RawAnchorPlaysByEpisodeData
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO anchorPlaysByEpisode (
            account_id,
            episode_id,
            date,
            plays
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                episodeId,
                getDateFromTimestamp(entry[0]),
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
            date,
            gender,
            plays_percent
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                getTodayDBString(),
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
            date,
            geo,
            plays_percent
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                getTodayDBString(),
                entry[0],
                entry[1],
            ])
            queryPromises.push(queryPromise)
        })

        return Promise.all(queryPromises)
    }

    async storePlaysByGeoCity(
        accountId: number,
        country: string,
        data: RawAnchorPlaysByGeoData
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO anchorPlaysByGeoCity (
            account_id,
            date,
            country,
            city,
            plays_percent
        ) VALUES (?,?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                getTodayDBString(),
                country,
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
            podcast_id,
            episode_id,
            date,
            title,
            description,
            url,
            tracked_url,
            episode_image,
            share_link_path,
            share_link_embed_path,
            ad_count,
            created,
            publishOn,
            duration,
            hour_offset,
            is_deleted,
            is_published
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.podcastEpisodes.forEach((episode) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                podcastId,
                episode.podcastEpisodeId,
                getTodayDBString(),
                episode.title,
                episode.description,
                episode.url,
                episode.trackedUrl,
                episode.episodeImage,
                episode.shareLinkPath,
                episode.shareLinkEmbedPath,
                episode.adCount,
                new Date(episode.createdUnixTimestamp * 1000),
                // Note that the publishOnUnixTimestamp is in milliseconds, not seconds
                // that's why we don't multiply by 1000 here
                episode.publishOnUnixTimestamp !== null
                    ? new Date(episode.publishOnUnixTimestamp)
                    : null,
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
            date,
            plays
        ) VALUES (?,?,?)`

        const queryPromise = this.pool.query(replaceStmt, [
            accountId,
            getTodayDBString(),
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
            date,
            episode_id,
            plays
        ) VALUES (?,?,?,?)`

        const queryPromises: Promise<any>[] = []

        data.rows.forEach((entry) => {
            const queryPromise = this.pool.query(replaceStmt, [
                accountId,
                getTodayDBString(),
                entry[1],
                entry[2],
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
            date,
            unique_listeners
        ) VALUES (?,?,?)`

        const queryPromise = this.pool.query(replaceStmt, [
            accountId,
            getTodayDBString(),
            data.rows[0],
        ])

        return queryPromise
    }
}

export { AnchorRepository }
