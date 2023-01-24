import { Pool } from 'mysql2/promise'
import { StatusPayload } from '../types/api'

type Status = {
    accountId: number
    latestUpdates: {
        [key: string]: Date
    }[]
}

class StatusRepository {
    pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    // Reads from the `updates` table and returns the latest status
    // updates for the given accountId and endpoint.
    // (Updates are stored in JSON format)
    //
    // Returns all rows as a single object like this:
    // {
    //     account_id: 1,
    //     latestUpdates: [
    //         'aggregate': '2021-01-01 00:00:00'
    //         'detailedStreams': '2021-01-01 00:00:00'
    //     ]
    // }
    async getStatus(accountId: number): Promise<Status> {
        const query = `SELECT u.endpoint, u.timestamp FROM updates u WHERE u.timestamp = (SELECT MAX(u2.timestamp) FROM updates u2 WHERE u2.endpoint = u.endpoint AND u2.account_id = ?) AND u.account_id = ? ORDER BY u.endpoint ASC;`
        const rows = await this.pool.query(query, accountId)
        return {
            accountId: accountId,
            latestUpdates: rows.map((row: any) => {
                return {
                    [row.endpoint]: row.timestamp,
                }
            }),
        }
    }

    // Write the raw JSON status data into the `updates` table
    // Use the current timestamp as the update time
    async updateStatus(accountId: number, update: StatusPayload): Promise<any> {
        const query = `INSERT INTO updates (account_id, endpoint, update_data) VALUES (?, ?, ?)`
        return await this.pool.query(query, [
            accountId,
            update.endpoint,
            JSON.stringify(update.data),
        ])
    }
}

export { StatusRepository }
