import { Pool } from 'mysql2/promise'
import {
    SpotifyDetailedStreamsPayload,
    SpotifyListenersPayload,
} from '../types/connector'

class SpotifyRepository {
    pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    async storeDetailedStreams(
        accountId: number,
        payload: SpotifyDetailedStreamsPayload
    ): Promise<any> {
        const replaceStmt =
            'REPLACE INTO spotifyDetailedStreams (account_id, sps_date, sps_starts, sps_streams) VALUES (?,?,?,?)'

        return await Promise.all(
            payload.detailedStreams.map(
                async (entry: any): Promise<any> =>
                    await this.pool.query(replaceStmt, [
                        accountId,
                        entry.date,
                        entry.starts,
                        entry.streams,
                    ])
            )
        )
    }

    async storeListeners(
        accountId: number,
        episodeId: string,
        payload: SpotifyListenersPayload
    ): Promise<any> {
        const replaceStmt =
            'REPLACE INTO spotifyListeners (account_id, episode_id, spl_date, spl_count) VALUES (?,?,?,?)'

        return await Promise.all(
            payload.counts.map(
                async (entry: any): Promise<any> =>
                    await this.pool.execute(replaceStmt, [
                        accountId,
                        episodeId,
                        entry.date,
                        entry.count,
                    ])
            )
        )
    }
}

export { SpotifyRepository }
