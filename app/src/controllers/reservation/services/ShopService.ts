import { ShopServiceInterface } from '@reservation/ReservationController'
import { RoleSlug } from '@entities/Role'
import ShopRepository from '@reservation/repositories/ShopRepository'
import { AuthorizationError, NotFoundError } from '@errors/ServiceErrors'

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
      throw new AuthorizationError('Shop is not owned by user')
    }

    const seatCount = await ShopRepository.fetchShopSeatCount(shopId)
    if (!seatCount) {
      throw new NotFoundError('Shop does not exist')
    }
    return seatCount
  },
}

export default ShopService
