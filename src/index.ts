import dotenv from 'dotenv'
import express, { Express, Request, Response, RequestHandler } from 'express'
import bodyParser from 'body-parser'
import { EventsApi, ConnectorApi } from './api'
import { EventRepository } from './db/EventRepository'
import { SpotifyRepository } from './db/SpotifyRepository'
import { authMiddleware } from './auth'
import { HttpError, PayloadError } from './types/api'
import mysql from 'mysql2/promise'
import { SpotifyConnector } from './api/connectors/SpotifyConnector'

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

// parameter map will consist of spotify and apple in the future
const connectorApi = new ConnectorApi({ spotify: spotifyConnector })

const app: Express = express()
const port = 8080

// extract json payload from body automatically
app.use(bodyParser.json({ limit: '1mb' }))

// throw exception if not authorized
app.use(authMiddleware)

// throw error if no payload submitted
app.use(function (req: Request, res: Response, next: Function) {
    if (Object.keys(req.body).length === 0) {
        const err = new PayloadError('Request format invalid')
        return next(err)
    }
    return next()
})

// endpoint for events coming from the proxy
app.post('/events', (async (req: Request, res: Response, next: Function) => {
    // express can't directly catch errors in await calls, so we have re-throw it
    try {
        await eventsApi.handleApiPost(res.locals.user.accountId, req.body)
        res.send('Data stored. Thx')
    } catch (err) {
        next(err)
    }
}) as RequestHandler)

// endpoint for the connectors importing data from spotify and apple
app.post('/connector', (async (req: Request, res: Response, next: Function) => {
    try {
        await connectorApi.handleApiPost(res.locals.user.accountId, req.body)
        res.send('Data stored. Thx')
    } catch (err) {
        next(err)
    }
}) as RequestHandler)

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: Function) {
    const err = new HttpError('File Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use(function (err: Error, req: Request, res: Response, next: Function) {
    let httpCode: number = 500
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
