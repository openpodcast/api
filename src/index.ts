import dotenv from 'dotenv'
import express, { Express, Request, Response, RequestHandler } from 'express'
import bodyParser from 'body-parser'
import { Api } from './api'
import { MySQLEvents } from './db'
import { AuthError } from './types/api'

dotenv.config()
const dbEvents = new MySQLEvents(process.env.DB_CONNECTION_STRING)
const api = new Api(dbEvents)

const app: Express = express()
const port = 8080

// extract json payload from body automatically
app.use(bodyParser.json())

app.post('/events', (async (req: Request, res: Response) => {
  const authToken = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization
  try {
    await api.handleApiPost(authToken, req.body)
    res.send('Data stored. Thx')
  } catch (e) {
    if (e instanceof AuthError) {
      res.status(401).send('Not authorized')
    } else {
      console.log(e)
      res.status(500).send('Error while handling data')
    }
  }
}) as RequestHandler)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`)
})
