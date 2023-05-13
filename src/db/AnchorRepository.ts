import { i } from 'mathjs'
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
} from '../types/connector'

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
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

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
            apbar_plays
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
}

export { AnchorRepository }
