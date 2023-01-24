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
import { StatusRepository } from './db/StatusRepository'
import { StatusApi } from './api/StatusApi'
import crypto from 'crypto'
import { body, validationResult } from 'express-validator'
import { Config } from './config'
import { DBInitializer } from './db/DBInitializer'

const config = new Config()

const pool = mysql.createPool({
    uri: config.getMySQLConnectionString(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

// checks if tables are there or runs the whole schema.sql script
const dbInit = new DBInitializer(
    pool,
    ['events', 'appleTrendsPodcastFollowers'],
    config.getSchemaData()
)
dbInit.init()

const eventRepo = new EventRepository(pool)
const eventsApi = new EventsApi(eventRepo)

const spotifyRepo = new SpotifyRepository(pool)
const spotifyConnector = new SpotifyConnector(spotifyRepo)

const appleRepo = new AppleRepository(pool)
const appleConnector = new AppleConnector(appleRepo)

const feedbackRepo = new FeedbackRepository(pool)
const feedbackApi = new FeedbackApi(feedbackRepo)

const statusRepo = new StatusRepository(pool)
const statusApi = new StatusApi(statusRepo)

// parameter map will consist of spotify and apple in the future
const connectorApi = new ConnectorApi({
    spotify: spotifyConnector,
    apple: appleConnector,
})

// defines all endpoints where auth is not required
const publicEndpoints = ['/images/*', '/health', '/feedback/*', '/comments/*']

const authController = new AuthController(config.getAccountsMap())

const app: Express = express()
const port = config.getExpressPort()

// extract json payload from body automatically
app.use(bodyParser.json({ limit: '1mb' }))

app.use(express.static('public'))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: false }))

// throw exception if not authorized
app.use(unless(publicEndpoints, authController.getMiddleware()))

// throw error if no payload submitted
app.use(
    unless(
        publicEndpoints,
        function (req: Request, res: Response, next: NextFunction) {
            // exclude status endpoint from this middleware
            if (Object.keys(req.body).length === 0 && req.path !== '/status') {
                const err = new PayloadError('Request format invalid')
                return next(err)
            }
            return next()
        }
    )
)

// request handler which runs after all other request handlers
// and handles storing events in the database (event sourcing)
app.use(async (req: Request, res: Response, next: NextFunction) => {
    const afterResponse = async () => {
        try {
            // See if we received an update from the previous request handlers
            // If not, we don't need to store anything
            // (Not all endpoints return an update)
            const update = res.locals.update
            if (!update) {
                // All good, nothing to do. Call next() to continue
                return
            }
            await statusApi.updateStatus(res.locals.user.accountId, update)
        } catch (err) {
            console.error(err)
        }
    }
    res.on('close', afterResponse)
    next()
})

const userHashMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    ip = Array.isArray(ip) ? ip[0] : ip
    ip = ip || ''

    let agent = req.headers['user-agent']
    agent = agent || ''

    req.headers.userHash = crypto
        .createHash('sha256')
        .update(ip + agent)
        .digest('hex')

    next()
}

app.get(
    '/feedback/:episodeId/:feedbackType',
    userHashMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        const feedbackType = req.params.feedbackType
        const episodeId = req.params.episodeId
        try {
            await feedbackApi.handleApiGet(
                episodeId,
                req.headers.userHash as string,
                feedbackType
            )
            const numberOfComments = await feedbackApi.getNumberOfComments(
                episodeId
            )
            res.render('feedback.hbs', { episodeId, numberOfComments })
        } catch (err) {
            next(err)
        }
    }
)

// Status endpoint, which returns a JSON of the last import time per endpoint.
// This uses our internal event sourcing to determine the last imports.
app.get('/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = await statusApi.getStatus(res.locals.user.accountId)
        res.json(status)
    } catch (err) {
        next(err)
    }
})

app.post(
    '/comments/:episodeId',
    userHashMiddleware,
    body('email').isEmail(),
    body('comment').not().isEmpty().trim().isLength({ min: 3, max: 1000 }),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const episodeId = req.params.episodeId
        try {
            await feedbackApi.handleCommentPost(
                episodeId,
                req.headers.userHash as string,
                req.body.comment
            )

            res.render('comment.hbs')
        } catch (err) {
            next(err)
        }
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
        const connectorPayload = await connectorApi.handleApiPost(
            res.locals.user.accountId,
            req.body
        )
        res.send('Data stored. Thx')

        // Construct a payload for event sourcing
        res.locals.update = {
            endpoint: connectorPayload.meta.endpoint,
            // TODO: Which data should be stored?
            data: connectorPayload.data,
        }
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
    const err = new HttpError('Not Found')
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
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
