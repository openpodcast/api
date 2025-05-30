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
        let query = this.queries.get(endpoint)

        if (!query) {
            throw new Error(`Query not found for endpoint ${endpoint}`)
        }

        // Originally based on the variable system in MySQL
        // as the optimizer had huge problems with @VARS in queries
        // we changed to use our own replacement system

        // escape first and then replace all occurrences of the key in the query with the escaped value
        for (const [key, value] of Object.entries(sqlVars)) {
            const escapedValue: string =
                // bit weird, but this is the only way to get the escape function without a type error
                (this.pool as unknown as Connection).escape(value)
            query = query?.replaceAll(`@${key}`, escapedValue)
        }

        // Execute the query and return the result
        const [rows, _] = await this.pool.query(query)
        return rows
    }
}

export { AnalyticsRepository }
