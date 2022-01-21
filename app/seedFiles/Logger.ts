import * as winston from 'winston'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => 'debug'

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const date = () => new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo', hour12: false })

const format = winston.format.combine(
  winston.format.timestamp({ format: date }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

const transports = [
  new winston.transports.Console(),
]

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

export default Logger
