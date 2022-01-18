import * as Cron from 'node-cron'
import Logger from '@lib/Logger'
import CronController from 'src/controllers/cron/CronController'

export type CronControllerInterface = {
  setPopularMenus(): Promise<void>
  setReservationStatuses(): Promise<void>
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

const jobs = [
  setPopularMenus,
  setReservationStatuses,
]

export default jobs
