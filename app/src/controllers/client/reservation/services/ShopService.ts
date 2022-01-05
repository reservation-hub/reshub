import { ShopServiceInterface } from '@client/reservation/ReservationController'
import Logger from '@lib/Logger'
import { NotFoundError } from '@errors/ServiceErrors'
import ShopRepository from '@client/reservation/repositories/ShopRepository'

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
  fetchShopSeatCount(shopId: number): Promise<number | null>
}

const ShopService: ShopServiceInterface = {
  async fetchShopSeatCount(user, shopId) {
    const seatCount = await ShopRepository.fetchShopSeatCount(shopId)
    if (!seatCount) {
      Logger.debug('Shop does not exist')
      throw new NotFoundError()
    }
    return seatCount
  },
}

export default ShopService
