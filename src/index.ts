import express, { Express, Request, Response } from 'express'
import bodyParser from 'body-parser'
import { handleApiPost } from './api'
import { AuthError } from './api/types'

const app: Express = express();
const port = 8080

app.use(bodyParser.json())

app.get('/', (req: Request, res: Response) => {
  const bearer = Array.isArray(req.headers.bearer) ? req.headers.bearer[0] : req.headers.bearer
  try {
    handleApiPost(bearer, req.body)
    res.send('Data stored. Thx');
  } catch(e) {
    if (e instanceof AuthError) {
      res.status(401).send('Not authorized')
    } else {
      res.status(500).send('Error while handling data')
    }
  }  
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
}); 