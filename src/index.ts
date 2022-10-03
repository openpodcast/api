import dotenv from 'dotenv'
import express, { Express, Request, Response, RequestHandler } from 'express'
import bodyParser from 'body-parser'
import { EventsApi, ConnectorApi } from './api'
import { MySQLEvents } from './db/MySQLEvents'
import { authMiddleware } from './auth'
import { HttpError, PayloadError } from './types/api'

dotenv.config()
const dbEvents = new MySQLEvents(process.env.DB_CONNECTION_STRING)
const eventsApi = new EventsApi(dbEvents)
const connectorApi = new ConnectorApi(dbEvents)

const app: Express = express()
const port = 8080

// extract json payload from body automatically
app.use(bodyParser.json())

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
