import { Pool } from 'mysql2/promise'

class FeedbackRepository {
    async addComment(
        accountId: number,
        episodeId: number,
        hash: string,
        comment: string
    ) {
        const query = `REPLACE INTO feedbackComment (account_id, episode_id, user_hash, comment) VALUES (?, ?, ?, ?)`
        return await this.pool.query(query, [
            accountId,
            episodeId,
            hash,
            comment,
        ])
    }
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
