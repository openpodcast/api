import dotenv from 'dotenv'
import express, {
    Express,
    Request,
    Response,
    RequestHandler,
    NextFunction,
} from 'express'
import bodyParser from 'body-parser'
import { EventsApi, ConnectorApi } from './api'
import { EventRepository } from './db/EventRepository'
import { SpotifyRepository } from './db/SpotifyRepository'
import { AuthController } from './auth/AuthController'
import { HttpError, PayloadError } from './types/api'
import { SpotifyConnector } from './api/connectors/SpotifyConnector'
import { AppleRepository } from './db/AppleRepository'
import { AppleConnector } from './api/connectors/AppleConnector'
import { healthCheck, mysqlHealthy } from './healthcheck'
import mysql from 'mysql2/promise'
import { unless } from './expressHelpers'
import { FeedbackRepository } from './db/FeedbackRepository'
import { FeedbackApi } from './api/FeedbackApi'

dotenv.config()

const pool = mysql.createPool({
    uri: process.env.DB_CONNECTION_STRING,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

const eventRepo = new EventRepository(pool)
const eventsApi = new EventsApi(eventRepo)

const spotifyRepo = new SpotifyRepository(pool)
const spotifyConnector = new SpotifyConnector(spotifyRepo)

const appleRepo = new AppleRepository(pool)
const appleConnector = new AppleConnector(appleRepo)

const feedbackRepo = new FeedbackRepository(pool)
const feedbackApi = new FeedbackApi(feedbackRepo)

// parameter map will consist of spotify and apple in the future
const connectorApi = new ConnectorApi({
    spotify: spotifyConnector,
    apple: appleConnector,
})

// defines all endpoints where auth is not required
const publicEndpoints = ['/health', '/feedback/*']

const authController = new AuthController()

const app: Express = express()
const port = 8080

// extract json payload from body automatically
app.use(bodyParser.json({ limit: '1mb' }))

// throw exception if not authorized
app.use(unless(publicEndpoints, authController.getMiddleware()))

// throw error if no payload submitted
app.use(
    unless(
        publicEndpoints,
        function (req: Request, res: Response, next: NextFunction) {
            if (Object.keys(req.body).length === 0) {
                const err = new PayloadError('Request format invalid')
                return next(err)
            }
            return next()
        }
    )
)

app.get(
    '/feedback/:episodeId/:feedbackType',
    async (req: Request, res: Response) => {
        //get users ip address
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        // get users agent
        const agent = req.headers['user-agent']

        const feedbackType = req.params.feedbackType
        const episodeId = req.params.episodeId

        await feedbackApi.handleApiGet(
            episodeId,
            Array.isArray(ip) ? ip[0] : ip,
            agent,
            feedbackType
        )
        res.send('Feedback stored. Thx')
    }
)

// endpoint for events coming from the proxy
app.post('/events', (async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // express can't directly catch errors in await calls, so we have re-throw it
    try {
        await eventsApi.handleApiPost(res.locals.user.accountId, req.body)
        res.send('Data stored. Thx')
    } catch (err) {
        next(err)
    }
}) as RequestHandler)

// endpoint for the connectors importing data from spotify and apple
app.post('/connector', (async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await connectorApi.handleApiPost(res.locals.user.accountId, req.body)
        res.send('Data stored. Thx')
    } catch (err) {
        next(err)
    }
}) as RequestHandler)

app.get(
    '/health',
    healthCheck({
        db: mysqlHealthy(pool),
    })
)

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
    const err = new HttpError('File Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use(function (err: Error, req: Request, res: Response) {
    let httpCode = 500
    if (err instanceof HttpError) {
        console.log(err)
        httpCode = err.status
    } else {
        // if it is not a known http error, print it for debugging purposes
        console.log(err)
    }
    res.status(httpCode)
    res.send(err.message)
})

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
