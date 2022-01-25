import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'

import MorganMiddleware from '@lib/MorganMiddleware'
import config from './config'
import routes from './routes'
import { errorHandler } from './errorHandler'

export const app: express.Express = express()

app.use(MorganMiddleware)
app.use(express.json())
app.use(cookieParser(config.JWT_TOKEN_SECRET))
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:3001',
    'http://localhost:8081',
    'http://184.72.186.149:8080',
    'http://184.72.186.149:8081',
  ],
  credentials: true,
}))
app.use(helmet())
app.use(routes)

app.use(errorHandler)
