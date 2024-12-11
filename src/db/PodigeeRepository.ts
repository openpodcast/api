import { Pool } from 'mysql2/promise'
import { PodigeeTokens } from '../types/provider/podigee'

export class PodigeeRepository {
    private pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    /**
     * Store OAuth tokens and related data for a Podigee account
     * @param accountId Internal account identifier
     * @param tokens Complete token response from Podigee
     */
    async saveTokens(accountId: number, tokens: PodigeeTokens): Promise<void> {
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

        const query = `
            INSERT INTO podigeeOAuthTokens (
                account_id,
                podigee_user_id,
                podigee_podcast_id,
                access_token,
                refresh_token,
                token_type,
                scope,
                expires_at,
                raw_token_response,
                created_at,
                updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) ON DUPLICATE KEY UPDATE
                access_token = VALUES(access_token),
                refresh_token = VALUES(refresh_token),
                token_type = VALUES(token_type),
                scope = VALUES(scope),
                expires_at = VALUES(expires_at),
                raw_token_response = VALUES(raw_token_response),
                updated_at = CURRENT_TIMESTAMP
        `

        await this.pool.execute(query, [
            accountId,
            tokens.podigee_user_id,
            tokens.podigee_podcast_id,
            tokens.access_token,
            tokens.refresh_token,
            tokens.token_type,
            tokens.scope || null,
            expiresAt,
            JSON.stringify(tokens),
        ])
    }

    /**
     * Get stored OAuth tokens for an account
     * @param accountId Internal account identifier
     * @returns Token data or null if not found
     */
    async getTokens(accountId: number): Promise<PodigeeTokens | null> {
        const query = `
            SELECT 
                podigee_user_id,
                podigee_podcast_id,
                access_token,
                refresh_token,
                token_type,
                scope,
                expires_at,
                raw_token_response
            FROM podigeeOAuthTokens
            WHERE account_id = ?
            AND expires_at > CURRENT_TIMESTAMP
            LIMIT 1
        `

        const [rows] = await this.pool.execute(query, [accountId])
        if (Array.isArray(rows) && rows.length > 0) {
            const row = rows[0] as any
            return JSON.parse(row.raw_token_response)
        }
        return null
    }

    /**
     * Check if an account has valid Podigee OAuth tokens
     * @param accountId Internal account identifier
     * @returns boolean indicating if valid tokens exist
     */
    async hasValidTokens(accountId: number): Promise<boolean> {
        const query = `
            SELECT COUNT(*) as count
            FROM podigeeOAuthTokens
            WHERE account_id = ?
            AND expires_at > CURRENT_TIMESTAMP
        `
        const [rows] = await this.pool.execute(query, [accountId])
        return (rows as any)[0].count > 0
    }
}
