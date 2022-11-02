import e from 'express'
import { Pool } from 'mysql2/promise'
import {
    AppleEpisodePayload,
    AppleEpisodePlayCountPayload,
} from '../types/connector'

class AppleRepository {
    pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    // store play counts that is send from the episodes api together with  metadata
    async storeEpisodesPlayCount(
        accountId: number,
        episodesPlayCounts: AppleEpisodePlayCountPayload[][]
    ): Promise<any> {
        const replaceStmt = `REPLACE INTO appleEpisodePlayCounts (
            account_id,
            episode_id,
            apc_playscount,
            apc_totaltimelistened,
            apc_uniqueengagedlistenerscount,
            apc_uniquelistenerscount
            ) VALUES
            (?,?,?,?,?,?)`

        return await Promise.all(
            episodesPlayCounts.map(
                async (
                    entries: AppleEpisodePlayCountPayload[]
                ): Promise<any> => {
                    // the apple api allows an array of playcount objects which doesn't make a lot of sense
                    // as there is always just one entry returned. therefore, we just use the first and only
                    // element of the given array of playcount objects
                    const entry = entries[0]
                    return await this.pool.query(replaceStmt, [
                        accountId,
                        entry.episodeid,
                        entry.playscount,
                        entry.totaltimelistened,
                        entry.uniqueengagedlistenerscount,
                        entry.uniquelistenerscount,
                    ])
                }
            )
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
}

export { AppleRepository }
