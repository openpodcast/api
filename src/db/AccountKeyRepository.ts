import { Pool, RowDataPacket } from 'mysql2/promise'
import crypto from 'crypto'
import { i } from 'mathjs'

class AccountKeyRepository {
    private pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    /**
     * Get account ID by API key
     *
     * @param apiKey The API key to lookup
     * @returns Account ID if found, null otherwise
     */
    async getAccountIdByKey(apiKey: string): Promise<number | null> {
        if (!apiKey || apiKey.length === 0 || apiKey.length > 255) {
            throw new Error('Invalid API key')
        }
        const hashedKey = this.hashKey(apiKey)

        const [rows] = await this.pool.execute<RowDataPacket[]>(
            'SELECT account_id FROM apiKeys WHERE key_hash = ?',
            [hashedKey]
        )

        return (rows[0].account_id as number) || null
    }

    /**
     * Hash an API key for secure storage
     *
     * @param apiKey The API key to hash
     * @returns The hashed key
     */
    private hashKey(apiKey: string): string {
        return crypto.createHash('sha256').update(apiKey).digest('hex')
    }
}

export { AccountKeyRepository }
