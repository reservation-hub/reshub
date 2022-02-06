import { CronControllerInterface } from '@lib/Cron'
import MenuService from '@cron/services/MenuService'
import ReservationService from '@cron/services/ReservationService'
import TagService from '@cron/services/TagService'
import ShopService from '@cron/services/ShopService'

export type MenuServiceInterface = {
  setPopularMenus(): Promise<void>
}

export type ReservationServiceInterface = {
  setReservationStatuses(): Promise<void>
}

export type TagServiceInterface = {
  cleanUpTags(): Promise<void>
}

export type ShopServiceInterface = {
  setPopularShops(): Promise<void>
}

const CronController: CronControllerInterface = {
  async setPopularMenus() {
    await MenuService.setPopularMenus()
  },

  async setReservationStatuses() {
    await ReservationService.setReservationStatuses()
  },

  async cleanUpTags() {
    await TagService.cleanUpTags()
  },

  async setPopularShops() {
    await ShopService.setPopularShops()
  },
}

export default CronController
