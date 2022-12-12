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
        vote: boolean
    ): Promise<any> {
        const query = `REPLACE INTO feedbackVote (account_id, episode_id, user_hash, vote) VALUES (?, ?, ?, ?)`
        return await this.pool.query(query, [
            accountId,
            episodeId,
            userHash,
            vote,
        ])
    }
}

export { FeedbackRepository }
