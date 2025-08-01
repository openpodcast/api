import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import crypto from 'crypto'

class AccountKeyRepository {
    private pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    /**
     * Get account IDs by API key
     *
     * @param apiKey The API key to lookup
     * @returns Array of account IDs if found, empty array otherwise
     */
    async getAccountIdsByKey(apiKey: string): Promise<number[]> {
        if (!apiKey || apiKey.length === 0 || apiKey.length > 255) {
            throw new Error('Invalid API key')
        }
        const hashedKey = this.hashKey(apiKey)

        const [rows] = await this.pool.execute<RowDataPacket[]>(
            'SELECT account_id FROM apiKeys WHERE key_hash = ?',
            [hashedKey]
        )

        if (!Array.isArray(rows) || rows.length === 0) {
            return [] // No accounts found for this key
        }

        return rows
            .filter((row) => row.account_id)
            .map((row) => row.account_id as number)
    }

    /**
     * Generate a new API key and store it for the given account ID
     *
     * @param accountId The account ID to associate with the API key
     * @returns The generated API key (not hashed)
     */
    async generateApiKey(accountId: number): Promise<string> {
        const apiKey = this.generateRandomApiKey()
        const hashedKey = this.hashKey(apiKey)

        await this.pool.execute<ResultSetHeader>(
            'INSERT INTO apiKeys (key_hash, account_id) VALUES (?, ?)',
            [hashedKey, accountId]
        )

        return apiKey
    }

    /**
     * Get the first API key hash for a given account ID
     * Note: This returns the hash, not the actual key (which cannot be retrieved)
     *
     * @param accountId The account ID to lookup
     * @returns The API key hash if found, null otherwise
     */
    async getApiKeyHashByAccountId(accountId: number): Promise<string | null> {
        const [rows] = await this.pool.execute<RowDataPacket[]>(
            'SELECT key_hash FROM apiKeys WHERE account_id = ? LIMIT 1',
            [accountId]
        )

        if (!Array.isArray(rows) || rows.length === 0) {
            return null
        }

        return rows[0].key_hash as string
    }

    /**
     * Generate a random API key in the format: op_<32 hex characters>
     *
     * @returns A random API key string
     */
    private generateRandomApiKey(): string {
        const randomBytes = crypto.randomBytes(16)
        const hexString = randomBytes.toString('hex')
        return `op_${hexString}`
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
