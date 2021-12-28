import morgan, { StreamOptions } from 'morgan'

import Logger from '@lib/Logger'
import config from '@config'

const stream: StreamOptions = {
  write: message => Logger.http(message),
}

const skip = () => config.NODE_ENV !== 'development'

const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip },
)

export default morganMiddleware
