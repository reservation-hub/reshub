import { ShopServiceInterface } from '@cron/CronController'
import ShopRepository from '@cron/repositories/ShopRepository'

export type ShopRepositoryInterface = {
  setPopularShops(): Promise<void>
}

const ShopService: ShopServiceInterface = {
  async setPopularShops() {
    await ShopRepository.setPopularShops()
  },
}

export default ShopService
