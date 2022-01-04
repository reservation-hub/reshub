import { ShopServiceInterface } from '@reservation/ReservationController'
import { RoleSlug } from '@entities/Role'
import ShopRepository from '@reservation/repositories/ShopRepository'
import Logger from '@lib/Logger'
import { AuthorizationError, NotFoundError } from '@reservation/services/ServiceError'

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
  fetchShopSeatCount(shopId: number): Promise<number | null>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const ShopService: ShopServiceInterface = {
  async fetchShopSeatCount(user, shopId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      Logger.debug('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const seatCount = await ShopRepository.fetchShopSeatCount(shopId)
    if (!seatCount) {
      Logger.debug('Shop does not exist')
      throw new NotFoundError()
    }
    return seatCount
  },
}

export default ShopService
