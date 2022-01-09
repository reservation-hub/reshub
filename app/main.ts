import Logger from '@lib/Logger'
import config from '@config'
import CronJobs from '@lib/Cron'
import { app } from './src/app'

/**
 * start cron jobs
 */

CronJobs.forEach(job => {
  job.start()
})

app.listen(8090, () => {
  Logger.info('server is up')
  Logger.info(`env: ${config.NODE_ENV}`)
})
