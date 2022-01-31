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
    config.ADMIN_URL,
    config.CLIENT_URL,
  ],
  credentials: true,
}))
app.use(helmet())
app.use(routes)

app.use(errorHandler)
