// Loads and executes the queries from the .sql files in the `queries` directory.
// Returns JSON objects with the results of the queries.

import path from 'path'
import fs from 'fs'

class QueryLoader {
    queryPath: string

    constructor(queryPath: string) {
        this.queryPath = queryPath
    }

    // Load the queries from the .sql files in the `queries` directory.
    // Returns a map of query names to query text.
    loadQueries(): Map<string, string> {
        // Map of query names to query text
        // {
        //   "v1/region": "SELECT * FROM region",
        //   "v1/gender": "SELECT * FROM gender",
        //   "v2/region": "SELECT * FROM region",
        // }
        const queries = new Map<string, string>()

        // Recursively walk the directory structure
        // Example:
        //   queries/
        //     v1/
        //       region.sql
        //       gender.sql
        //     v2/
        //       region.sql

        const dir = this.queryPath

        // Read all files in the directory
        const versions = fs.readdirSync(dir)

        // For each version
        versions.forEach((version: string) => {
            // Skip and log files that are not directories
            if (!fs.statSync(path.join(dir, version)).isDirectory()) {
                console.log(`Skipping ${version} because it is not a directory`)
                return
            }

            // Read all files in the directory
            const files = fs.readdirSync(path.join(dir, version))

            files.forEach((file: string) => {
                // valid file names are <name>.sql
                const match = file.match(/^(.*)\.sql$/)
                if (!match) {
                    return
                }

                // Map the query name to the query text
                const queryName = match[1]
                const queryPath = path.join(dir, version, file)
                const endpoint = `${version}/${queryName}`
                const queryText = fs.readFileSync(queryPath, 'utf8')

                if (!queryText) {
                    throw new Error(
                        `Query text is empty for ${endpoint}. This is probably a mistake.`
                    )
                }

                // Store the query text
                queries.set(endpoint, queryText)
            })
        })

        return queries
    }
}

export { QueryLoader }
