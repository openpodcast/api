import {
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
            getTodayDBString(),
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
            data.ep_release_date,
        ])
    }

    async storeHosterEpisodeMetrics(
        hosterId: number,
        accountId: number,
        episode: string,
        data: HosterMetricsPayload
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO hosterEpisodeMetrics (
            account_id,
            hoster_id,
            episode_id,
            start,
            end,
            dimension,
            subdimension,
            value
            ) VALUES
            (?,?,?,?,?,?,?,?)`
        return this.pool.query(replaceStmt, [
            accountId,
            hosterId,
            episode,
            convertAnyDatetimeToDBString(data.start),
            convertAnyDatetimeToDBString(data.end),
            data.dimension,
            data.subdimension,
            data.value,
        ])
    }

    async storeHosterPodcastMetrics(
        hosterId: number,
        accountId: number,
        data: HosterMetricsPayload
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO hosterPodcastMetrics (
            account_id,
            hoster_id,
            start,
            end,
            dimension,
            subdimension,
            value
            ) VALUES
            (?,?,?,?,?,?,?)`
        return this.pool.query(replaceStmt, [
            accountId,
            hosterId,
            convertAnyDatetimeToDBString(data.start),
            convertAnyDatetimeToDBString(data.end),
            data.dimension,
            data.subdimension,
            data.value,
        ])
    }
}

export { HosterRepository }
