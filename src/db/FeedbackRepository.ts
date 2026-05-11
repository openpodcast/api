import { Pool } from 'mysql2/promise'

class FeedbackRepository {
    async addComment(
        accountId: number,
        episodeId: number,
        hash: string,
        comment: string,
        email?: string
    ) {
        const query = `INSERT INTO feedbackComment (account_id, episode_id, user_hash, comment) VALUES (?, ?, ?, ?)`
        const commentWithEmail = email ? `${email}: ${comment}` : comment
        return await this.pool.query(query, [
            accountId,
            episodeId,
            hash,
            commentWithEmail,
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
        agent: string,
        vote: boolean
    ): Promise<any> {
        const query = `
            INSERT INTO feedbackVote (account_id, episode_id, user_hash, agent, vote)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE agent = VALUES(agent), vote = VALUES(vote)
        `
        return await this.pool.query(query, [
            accountId,
            episodeId,
            userHash,
            agent,
            vote,
        ])
    }

    // Get the number of comments for an episode
    async getNumberOfComments(episodeId: number): Promise<number> {
        const query = `SELECT COUNT(*) AS count FROM feedbackComment WHERE episode_id = ?`
        const [rows] = await this.pool.query(query, [episodeId])
        if (Array.isArray(rows)) {
            return (rows[0] as { count: number }).count
        } else {
            return 0
        }
    }
}

export { FeedbackRepository }
