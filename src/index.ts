import dotenv from 'dotenv'
import express, { Express, Request, Response, RequestHandler } from 'express'
import bodyParser from 'body-parser'
import { EventsApi } from './api'
import { MySQLEvents } from './db'
import { authMiddleware } from './auth'

dotenv.config()
const dbEvents = new MySQLEvents(process.env.DB_CONNECTION_STRING)
const api = new EventsApi(dbEvents)

const app: Express = express()
const port = 8080

// extract json payload from body automatically
app.use(bodyParser.json())

// throw exception if not authorized
app.use(authMiddleware)

app.post('/events', (async (req: Request, res: Response) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send('Request format invalid')
  }
  await api.handleApiPost(res.locals.user.accountId, req.body)
  res.send('Data stored. Thx')
}) as RequestHandler)

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: Function) {
  const err = new Error('File Not Found')
  err.status = 404
  next(err)
})

// error handler
// define as the last app.use callback
app.use(function (err: Error, req: Request, res: Response, next: Function) {
  res.status(err.status || 500)
  res.send(err.message)
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
