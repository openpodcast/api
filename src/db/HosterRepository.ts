import {
    HosterEpisodeMetadataPayload,
    HosterMetricsPayload,
    HosterPodcastMetadataPayload,
} from '../types/provider/hoster'

const convertAnyDatetimeToDBString = (date: any): string => {
    const dateObj = new Date(date)
    return dateObj.toISOString().slice(0, 19).replace('T', ' ')
}

class HosterRepository {
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

    async storeHosterPodcastMetadata(
        hosterId: number,
        accountId: number,
        data: HosterPodcastMetadataPayload
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO hosterPodcastMetadata (
            account_id,
            date,
            hoster_id,
            name
            ) VALUES
            (?,?,?,?)`

        return await this.pool.query(replaceStmt, [
            accountId,
            this.getTodayDBString(),
            hosterId,
            data.name,
        ])
    }

    async storeHosterEpisodeMetadata(
        hosterId: number,
        accountId: number,
        episode: string,
        data: HosterEpisodeMetadataPayload
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO hosterEpisodeMetadata (
            account_id,
            hoster_id,
            episode_id,
            ep_name,
            ep_url,
            ep_release_date
            ) VALUES
            (?,?,?,?,?,?)`
        return await this.pool.query(replaceStmt, [
            accountId,
            hosterId,
            episode,
            data.ep_name,
            data.ep_url,
            convertAnyDatetimeToDBString(data.ep_release_date),
        ])
    }

    async storeHosterEpisodeMetrics(
        hosterId: number,
        accountId: number,
        episode: string,
        data: HosterMetricsPayload
    ): Promise<any> {
        if (!data.metrics) {
            // No metrics to store
            return
        }

        const replaceStmt =
            `REPLACE INTO hosterEpisodeMetrics (
            account_id,
            hoster_id,
            episode_id,
            start,
            end,
            dimension,
            subdimension,
            value
        ) VALUES ` + data.metrics.map(() => '(?,?,?,?,?,?,?,?)').join(',')

        const values = data.metrics.flatMap((metric) => [
            accountId,
            hosterId,
            episode,
            convertAnyDatetimeToDBString(metric.start),
            convertAnyDatetimeToDBString(metric.end),
            metric.dimension,
            metric.subdimension,
            metric.value,
        ])

        return this.pool.query(replaceStmt, values)
    }

    async storeHosterPodcastMetrics(
        hosterId: number,
        accountId: number,
        data: HosterMetricsPayload
    ): Promise<any> {
        if (!data.metrics) {
            // No metrics to store
            return
        }

        const replaceStmt =
            `REPLACE INTO hosterPodcastMetrics (
            account_id,
            hoster_id,
            start,
            end,
            dimension,
            subdimension,
            value
        ) VALUES ` + data.metrics.map(() => '(?,?,?,?,?,?,?)').join(',')

        const values = data.metrics.flatMap((metric) => [
            accountId,
            hosterId,
            convertAnyDatetimeToDBString(metric.start),
            convertAnyDatetimeToDBString(metric.end),
            metric.dimension,
            metric.subdimension,
            metric.value,
        ])

        return this.pool.query(replaceStmt, values)
    }
}

export { HosterRepository }
