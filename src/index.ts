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
import { unless } from './utils/expressHelpers'
import { FeedbackRepository } from './db/FeedbackRepository'
import { FeedbackApi } from './api/FeedbackApi'
import { StatusRepository } from './db/StatusRepository'
import { StatusApi } from './api/StatusApi'
import crypto from 'crypto'
import { body, validationResult } from 'express-validator'
import { Config } from './config'
import { DBInitializer } from './db/DBInitializer'
import { QueryLoader } from './db/QueryLoader'
import { AnalyticsRepository } from './db/AnalyticsRepository'
import { AnalyticsApi } from './api/AnalyticsApi'
import { formatDate, nowString } from './utils/dateHelpers'

const config = new Config()

const pool = mysql.createPool({
    uri: config.getMySQLConnectionString(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    // do not touch dates and return native string representation
    // see https://github.com/mysqljs/mysql#connection-options
    dateStrings: true,
})

// checks if tables are there or runs the whole schema.sql script
const dbInit = new DBInitializer(
    pool,
    ['events', 'appleTrendsPodcastFollowers'],
    config.getSchemaData(),
    config.getViewsData(),
    config.getMigrationsPath()
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

const queryLoader = new QueryLoader(config.getQueryPath())
const queries = queryLoader.loadQueries()

const analyticsRepo = new AnalyticsRepository(pool, queries)
const analyticsApi = new AnalyticsApi(analyticsRepo)

const statusRepo = new StatusRepository(pool)
const statusApi = new StatusApi(statusRepo)

// parameter map will consist of spotify and apple in the future
const connectorApi = new ConnectorApi({
    spotify: spotifyConnector,
    apple: appleConnector,
})

// defines all endpoints where auth is not required
const publicEndpoints = [
    '^/images/*',
    '^/health',
    '^/status',
    '^/feedback/*',
    '^/comments/*',
]

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
        // allow analytics endpoint and public endpoints
        // to be called without payload
        publicEndpoints.concat(['^/analytics/*']),
        function (req: Request, res: Response, next: NextFunction) {
            // exclude status endpoint from this middleware
            if (Object.keys(req.body).length === 0) {
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

// Analytics endpoint, which returns a JSON of the query results.
// Check that the user is allowed to access the endpoint
// and then run the query
// The endpoint must contain a version number and a query name
// e.g. /analytics/v1/1234/someQuery
// where 1234 is the podcast id and someQuery is the name of the query
app.get(
    '/analytics/:version/:podcastId/:query',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const accountId = res.locals.user.accountId

            // Throw error if accountId is not set
            if (!accountId || accountId === '') {
                res.status(401).send('Not authorized: accountId not set')
            }

            const podcastId = req.params.podcastId
            if (podcastId === '') {
                res.status(401).send('Not authorized: podcastId not set')
            }

            const version = req.params.version
            const query = req.params.query

            // Backwards compatibility:
            // For v1, the podcast id is the account id
            if (version === 'v1' && accountId != podcastId) {
                res.status(401).send(
                    'Not authorized: accountId must be podcastId in v1'
                )
            }

            // Get date from query parameters
            // If no date is provided, use date of yesterday
            // If it's an array, use throw an error
            const startDateString = req.query.start
            if (Array.isArray(startDateString)) {
                throw new Error('Start date must not be an array')
            }

            const endDateString = req.query.end
            if (Array.isArray(endDateString)) {
                throw new Error('End date must not be an array')
            }

            // use yesterday for default dates
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)

            const startDate = startDateString
                ? new Date(startDateString as string)
                : yesterday

            if (startDate.toString() === 'Invalid Date') {
                throw new Error('Start date is invalid')
            }

            // if no end date is provided, use the start date
            const endDate = endDateString
                ? new Date(endDateString as string)
                : startDate

            if (endDate.toString() === 'Invalid Date') {
                throw new Error('End date is invalid')
            }

            // throw an error if end date is before start date
            if (endDate < startDate) {
                throw new Error('End date must be after start date')
            }

            let data = null

            try {
                data = await analyticsApi.getAnalytics(
                    podcastId,
                    `${version}/${query}`,
                    startDate,
                    endDate
                )
            } catch (err) {
                console.log(err)
            }

            res.json({
                meta: {
                    query,
                    accountId,
                    podcastId,
                    date: nowString(),
                    startDate: formatDate(startDate),
                    endDate: formatDate(endDate),
                    result: data ? 'success' : 'error',
                },
                data,
            })
        } catch (err) {
            // Always return a 404 if the query is not found
            // (instead of the default 500)
            res.status(404)
            console.log(err)
            next(err)
        }
    }
)

// Status endpoint, which returns a JSON of the last import time per endpoint.
// This uses our internal event sourcing to determine the last imports.
// Additionally, it returns a list of alerts if any of the imports are too old.
app.get('/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const yellowAgeHours = 26
        const redAgeHours = 50
        const status = await statusApi.getStatus()
        const alerts = statusApi.getAgeAlerts(
            status,
            yellowAgeHours,
            redAgeHours
        )
        if (alerts.yellow || alerts.red) {
            res.status(500)
            res.json({ ...status, alerts })
        } else {
            res.status(200)
            res.json(status)
        }
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
            data: connectorPayload,
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
