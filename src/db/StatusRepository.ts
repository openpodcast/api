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

type FailedPodcast = {
    podcastId: number
    podcastName: string | null
}

type EndpointStatistics = {
    provider: string
    endpoint: string
    requests: {
        total: number
        successful: number
        failed: number
        successRate: number
    }
    failedPodcasts: FailedPodcast[]
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

    // Returns endpoint-level update statistics for the given period. Since the
    // updates table only records successful connector runs, a failed request here
    // means a podcast has not had a successful update for this endpoint within
    // the given period.
    async getEndpointStatistics(
        periodDays: number
    ): Promise<EndpointStatistics[]> {
        const query = `
            SELECT
                account_id,
                provider,
                endpoint,
                MAX(created) AS last_successful_update
            FROM updates
            GROUP BY account_id, provider, endpoint
            ORDER BY provider, endpoint, account_id
        `
        const response = (await this.pool.query(query)) as RowDataPacket[]

        const statistics: EndpointStatistics[] = []
        const statisticsByEndpoint: {
            [key: string]: EndpointStatistics
        } = {}
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - periodDays)

        response[0].forEach((row: RowDataPacket) => {
            const identifier = `${row.provider}/${row.endpoint}`

            if (!statisticsByEndpoint[identifier]) {
                statisticsByEndpoint[identifier] = {
                    provider: row.provider,
                    endpoint: row.endpoint,
                    requests: {
                        total: 0,
                        successful: 0,
                        failed: 0,
                        successRate: 0,
                    },
                    failedPodcasts: [],
                }
                statistics.push(statisticsByEndpoint[identifier])
            }

            const endpointStatistics = statisticsByEndpoint[identifier]
            const lastSuccessfulUpdate = new Date(row.last_successful_update)
            const hasRecentSuccessfulUpdate = lastSuccessfulUpdate >= startDate

            endpointStatistics.requests.total += 1
            if (hasRecentSuccessfulUpdate) {
                endpointStatistics.requests.successful += 1
            } else {
                endpointStatistics.requests.failed += 1
                endpointStatistics.failedPodcasts.push({
                    podcastId: row.account_id,
                    podcastName: null,
                })
            }
        })

        statistics.forEach((endpointStatistics) => {
            endpointStatistics.requests.successRate =
                endpointStatistics.requests.total > 0
                    ? endpointStatistics.requests.successful /
                      endpointStatistics.requests.total
                    : 0
        })

        return statistics
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

export { StatusRepository, EndpointStatistics }
