import { Pool, RowDataPacket } from 'mysql2/promise'
import { StatusPayload } from '../types/api'

// This is the type of the object that is returned by the `getStatus` method.
// It is a map where the key is the account ID and the value is an object
// containing the latest update time for each endpoint.
type Status = {
    [key: number]: {
        latestUpdates: {
            [key: string]: Date
        }
    }
}

type DailyEndpointUpdate = {
    accountId: number
    provider: string
    endpoint: string
    date: string
}

type EndpointFirstUpdate = {
    accountId: number
    provider: string
    endpoint: string
    date: string
}

class StatusRepository {
    pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    // Reads from the `updates` table and returns the latest status
    // updates for all endpoints of an account.
    // (Updates are stored in JSON format)
    //
    // Returns all rows as a single object like this where the key is the
    // account ID and the value is an array of objects with the endpoint name as
    // the key and the update time as the value:
    // {
    //     1: {
    //       latestUpdates: [
    //           'aggregate': '2021-01-01 00:00:00'
    //           'detailedStreams': '2021-01-01 00:00:00'
    //       ]
    //     },
    //     2: {
    //       latestUpdates: [
    //           ...
    //       ]
    //     }
    // }
    async getStatus(): Promise<Status> {
        const query = `SELECT account_id, provider, endpoint, MAX(created) AS latest_update FROM updates GROUP BY account_id, provider, endpoint`
        const response = (await this.pool.query(query)) as RowDataPacket[]

        // Response should have at least one row.
        // If not, return an empty object.
        if (response.length === 0) {
            return {}
        }

        const status: Status = {}
        response[0].forEach((row: RowDataPacket) => {
            // Create the account object if it doesn't exist yet
            if (!status[row.account_id]) {
                status[row.account_id] = {
                    latestUpdates: {},
                }
            }

            const identifier = `${row.provider}/${row.endpoint}`

            status[row.account_id].latestUpdates[identifier] = new Date(
                row.latest_update
            )
        })

        return status
    }

    async getDailyEndpointUpdates(
        periodDays: number
    ): Promise<DailyEndpointUpdate[]> {
        const query = `
            SELECT
                account_id,
                provider,
                endpoint,
                DATE(created) AS update_date
            FROM updates
            WHERE created >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY account_id, provider, endpoint, update_date
            ORDER BY update_date, provider, endpoint, account_id
        `
        const response = (await this.pool.query(query, [
            Math.max(periodDays - 1, 0),
        ])) as RowDataPacket[]

        return response[0].map((row: RowDataPacket) => ({
            accountId: row.account_id,
            provider: row.provider,
            endpoint: row.endpoint,
            date: row.update_date,
        }))
    }

    async getEndpointFirstUpdates(): Promise<EndpointFirstUpdate[]> {
        const query = `
            SELECT
                account_id,
                provider,
                endpoint,
                DATE(MIN(created)) AS first_update_date
            FROM updates
            GROUP BY account_id, provider, endpoint
            ORDER BY first_update_date, provider, endpoint, account_id
        `
        const response = (await this.pool.query(query)) as RowDataPacket[]

        return response[0].map((row: RowDataPacket) => ({
            accountId: row.account_id,
            provider: row.provider,
            endpoint: row.endpoint,
            date: row.first_update_date,
        }))
    }

    // Write the raw JSON status data into the `updates` table
    // Use the current timestamp as the update time
    async updateStatus(accountId: number, update: StatusPayload): Promise<any> {
        const query = `REPLACE INTO updates (account_id, provider, endpoint, update_data) VALUES (?,?,?,?)`
        return await this.pool.query(query, [
            accountId,
            update.provider,
            update.endpoint,
            JSON.stringify(update.data),
        ])
    }
}

export { StatusRepository, Status, DailyEndpointUpdate, EndpointFirstUpdate }
