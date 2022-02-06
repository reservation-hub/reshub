import * as Cron from 'node-cron'
import Logger from '@lib/Logger'
import CronController from 'src/controllers/cron/CronController'

export type CronControllerInterface = {
  setPopularMenus(): Promise<void>
  setReservationStatuses(): Promise<void>
  cleanUpTags(): Promise<void>
  setPopularShops(): Promise<void>
}

/**
 * Set Popular Menus
 */

const setPopularMenus = Cron.schedule('0 0,30 * * * *', async () => {
  Logger.info('Setting popular menus')
  await CronController.setPopularMenus()
  Logger.info('Popular menus set')
})

const setReservationStatuses = Cron.schedule('0 0,30 * * * *', async () => {
  Logger.info('Setting reservation statuses')
  await CronController.setReservationStatuses()
  Logger.info('Reservation statuses set')
})

const cleanUpTags = Cron.schedule('0 0 0 * * *', async () => {
  Logger.info('Cleaning up tags')
  await CronController.cleanUpTags()
  Logger.info('Tags clean up done')
})

const setPopularShops = Cron.schedule('0 15,45 * * * *', async () => {
  Logger.info('Setting popular shops')
  await CronController.setPopularShops()
  Logger.info('Popular shops set')
})

const jobs = [
  setPopularMenus,
  setReservationStatuses,
  cleanUpTags,
  setPopularShops,
]

export default jobs
