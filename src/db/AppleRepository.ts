import e from 'express'
import { Pool } from 'mysql2/promise'
import { AppleEpisodePayload } from '../types/connector'

class AppleRepository {
    pool

    constructor(pool: Pool) {
        this.pool = pool
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
