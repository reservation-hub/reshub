import { Tedis } from 'tedis'
import config from '@config'

export default new Tedis({
  port: config.REDIS_PORT,
  host: config.REDIS_HOST,
})
