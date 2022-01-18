import { CronControllerInterface } from '@lib/Cron'
import MenuService from '@cron/services/MenuService'
import ReservationService from '@cron/services/ReservationService'

export type MenuServiceInterface = {
  setPopularMenus(): Promise<void>
}

export type ReservationServiceInterface = {
  setReservationStatuses(): Promise<void>
}

const CronController: CronControllerInterface = {
  async setPopularMenus() {
    await MenuService.setPopularMenus()
  },

  async setReservationStatuses() {
    await ReservationService.setReservationStatuses()
  },
}

export default CronController
