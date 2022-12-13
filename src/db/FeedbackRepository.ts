import { Pool } from 'mysql2/promise'

class FeedbackRepository {
    async addComment(
        accountId: number,
        episodeId: number,
        hash: string,
        comment: string
    ) {
        const query = `INSERT INTO feedbackComment (account_id, episode_id, user_hash, comment) VALUES (?, ?, ?, ?)`
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

    // Get the number of comments for an episode
    async getNumberOfComments(episodeId: number): Promise<number> {
        const query = `SELECT COUNT(*) AS count FROM feedbackComment WHERE episode_id = ?`
        const [rows] = await this.pool.query(query, [episodeId])
        if (Array.isArray(rows)) {
            // TODO: There's probably a better way to do this
            // @ts-ignore
            return rows[0].count
        } else {
            return 0
        }
    }
}

export { FeedbackRepository }
