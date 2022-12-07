import { Express, Request, RequestHandler, Response } from 'express'
import { HealthCheckInterface } from './db/HealthCheckInterface'

function importHealthRoutes(
    app: Express,
    services: { [key: string]: HealthCheckInterface }
) {
    app.get('/health', (async (req: Request, res: Response) => {
        const statusMap = Object.entries(services).reduce(
            (
                acc: {
                    [k: string]: {
                        service: HealthCheckInterface
                        healthy: Promise<boolean>
                    }
                },
                [k, service]
            ) => {
                acc[k] = {
                    service,
                    healthy: service.healthy(),
                }
                return acc
            },
            {}
        )

        const results = await Promise.allSettled(
            Object.values(statusMap).map((s) => s.healthy)
        )

        const overallHealthy = results.every((v) => v)

        const status = overallHealthy ? 200 : 500
        res.status(status).send('test')
    }) as RequestHandler)
}

export { importHealthRoutes }
