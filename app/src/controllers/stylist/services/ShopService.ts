import { ShopServiceInterface } from '@stylist/StylistController'
import { AuthorizationError, NotFoundError } from '@stylist/services/ServiceError'
import { RoleSlug } from '@entities/Role'
import ShopRepository from '@stylist/repositories/ShopRepository'

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
  fetchShopName(shopId: number): Promise<string | null>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const ShopService: ShopServiceInterface = {
  async fetchShopName(user, shopId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const shopName = await ShopRepository.fetchShopName(shopId)
    if (!shopName) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }
    return shopName
  },
}

export default ShopService
