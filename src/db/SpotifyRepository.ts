import { Pool } from 'mysql2/promise'
import {
    SpotifyAggregatePayload,
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

    async storeAggregate(
        accountId: number,
        episodeId: string,
        date: string,
        payload: SpotifyAggregatePayload
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO spotifyAggregate (account_id, episode_id, spa_date, spa_age, 
            spa_gender_not_specified, spa_gender_female, spa_gender_male, spa_gender_non_binary) VALUES (?,?,?,?,?,?,?,?)`

        return await Promise.all(
            Object.keys(payload.ageFacetedCounts).map(
                async (ageGroup: string): Promise<any> => {
                    const entry = payload.ageFacetedCounts[ageGroup]
                    return await this.pool.execute(replaceStmt, [
                        accountId,
                        episodeId,
                        date,
                        ageGroup,
                        entry['counts']['NOT_SPECIFIED'],
                        entry['counts']['FEMALE'],
                        entry['counts']['MALE'],
                        entry['counts']['NON_BINARY'],
                    ])
                }
            )
        )
    }
}

export { SpotifyRepository }
