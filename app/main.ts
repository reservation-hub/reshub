import Logger from '@lib/Logger'
import { app } from './src/app'
import config from '@/config'

app.listen(8090, () => {
  Logger.info('server is up')
  Logger.info(`env: ${config.NODE_ENV}`)
})
