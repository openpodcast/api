import { Request, Response } from 'express'

// using the mysql lib typesystem didn't work for me with Pool
const mysqlHealthy = (pool: any) =>
    async function (): Promise<boolean> {
        const statement = 'SELECT 1'
        try {
            const result = await pool.query(statement)
            return result !== undefined
        } catch (e) {
            console.error(e)
            return false
        }
    }

function healthCheck(services: {
    [key: string]: () => Promise<boolean>
}): (req: Request, res: Response) => Promise<void> {
    const healthCheckHandler = async (req: Request, res: Response) => {
        const serviceIDs = Object.keys(services)

        // run all health checks in parallel
        const servicehealthChecks = Object.values(services).map(
            (healthCheckFun) => healthCheckFun()
        )

        // wait for all health checks to finish
        const results = await Promise.allSettled(servicehealthChecks)

        // check if all health checks were successful to decide on overall healthiness
        const overallHealthy = results.every(
            (v) => (v as PromiseFulfilledResult<boolean>).value
        )

        // return 200 if all checks were successful, 500 otherwise
        const status = overallHealthy ? 200 : 500

        // return the results of all checks with version information
        const response = serviceIDs.reduce(
            (acc: { [key: string]: any }, id, idx) => {
                acc[id] = (
                    results[idx] as PromiseFulfilledResult<boolean>
                ).value
                return acc
            },
            {}
        )

        // Add version information from environment variables
        response.version = process.env.VERSION || 'unknown'
        response.buildTime = process.env.BUILD_TIME || 'unknown'
        response.commit = process.env.COMMIT_HASH || 'unknown'

        res.status(status).send(response)
    }

    return healthCheckHandler
}

export { healthCheck, mysqlHealthy }
