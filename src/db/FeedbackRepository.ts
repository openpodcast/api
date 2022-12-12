import { Pool } from 'mysql2/promise'

class FeedbackRepository {
    pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    async addFeedback(
        accountId: number,
        episodeId: number,
        userHash: string,
        thumb: boolean
    ): Promise<any> {
        const query = `REPLACE INTO feedback (account_id, episode_id, user_hash, thumb) VALUES (?, ?, ?, ?)`
        return await this.pool.query(query, [
            accountId,
            episodeId,
            userHash,
            thumb,
        ])
    }
}

export { FeedbackRepository }
