import * as Cron from 'node-cron'
import Logger from '@lib/Logger'
import CronController from 'src/controllers/cron/CronController'

export type CronControllerInterface = {
  setPopularMenus(): Promise<void>
}

/**
 * Set Popular Menus
 */

const setPopularMenus = Cron.schedule('0 0,30 * * * *', async () => {
  Logger.info('Setting popular menus')
  await CronController.setPopularMenus()
  Logger.info('Popular menus set')
})

const jobs = [
  setPopularMenus,
]

export default jobs
