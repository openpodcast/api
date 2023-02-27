import { Connection, Pool } from 'mysql2/promise'

// A generic query handler for analytics endpoints.
// The queries are loaded from the filesystem and stored in a map.
// Incoming requests are mapped to the corresponding query and executed.
// Non-existing endpoints will throw an error.
class AnalyticsRepository {
    pool: Pool
    queries: Map<string, string>

    constructor(pool: Pool, queries: Map<string, string>) {
        this.pool = pool
        this.queries = queries
    }

    // Execute a query for an endpoint.
    async execute(endpoint: string, sqlVars = {}): Promise<any> {
        // Look up the query text for the endpoint
        const query = this.queries.get(endpoint)

        if (!query) {
            throw new Error(`Query not found for endpoint ${endpoint}`)
        }

        // Iterate over the values  and escape them
        const setStatements = []
        for (const [key, value] of Object.entries(sqlVars)) {
            const escapedValue: string =
                // bit weird, but this is the only way to get the escape function without a type error
                (this.pool as unknown as Connection).escape(value)
            setStatements.push(`SET @${key}=${escapedValue};`)
        }

        // Execute the query and return the result
        const [rows, _] = await this.pool.query(
            `${setStatements.join(' ')} ${query}`
        )

        // as we send multiple queries, we need to return only the last one
        // which contains the actual result
        if (setStatements.length > 0 && Array.isArray(rows)) {
            return rows[rows.length - 1]
        } else {
            return rows
        }
    }
}

export { AnalyticsRepository }
