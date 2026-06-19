import mysql from 'mysql2/promise'
import crypto from 'crypto'

function hashKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex')
}

async function insertApiKey(apiKey: string, accountId: number): Promise<void> {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'openpodcast',
        password: process.env.MYSQL_PASSWORD || 'openpodcast',
        database: process.env.MYSQL_DATABASE || 'openpodcast'
    })

    try {
        const hashedKey = hashKey(apiKey)
        const query = 'REPLACE INTO openpodcast_auth.apiKeys (key_hash, account_id) VALUES (?, ?)'

        console.log(`Inserting API key for account ${accountId}`)
        console.log(`Hashed key: ${hashedKey}`)

        await connection.execute(query, [hashedKey, accountId])
        console.log('API key inserted successfully')
    } catch (error) {
        console.error('Error inserting API key:', error)
        process.exit(1)
    } finally {
        await connection.end()
    }
}

// Command line argument parsing
if (process.argv.length !== 4) {
    console.error('Usage: ts-node scripts/insert-api-key.ts <api-key> <account-id>')
    console.error('Example: ts-node scripts/insert-api-key.ts dummy-cn389ncoiwuencr 3')
    process.exit(1)
}

const apiKey = process.argv[2]
const accountId = parseInt(process.argv[3])

if (isNaN(accountId)) {
    console.error('Account ID must be a valid number')
    process.exit(1)
}

insertApiKey(apiKey, accountId)