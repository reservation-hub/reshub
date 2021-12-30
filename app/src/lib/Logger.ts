import config from '@config'
import * as winston from 'winston'
import 'winston-daily-rotate-file'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  const isDevelopment = config.NODE_ENV === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

const transports = [
  new winston.transports.Console(),
  new winston.transports.DailyRotateFile({
    filename: '%DATE%.log',
    datePattern: 'yyyy-MM-DD',
    handleExceptions: true,
    level: 'error',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    dirname: '/app/logs/error',
  }),
  // new winston.transports.File({ filename: 'logs/all.log' }),
  new winston.transports.DailyRotateFile({
    filename: '%DATE%.log',
    datePattern: 'yyyy-MM-DD',
    dirname: '/app/logs/all',
    level: 'info',
    handleExceptions: true,
    // colorize: true,
    // json: false,
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
]

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

export default Logger
