import { ShopServiceInterface } from '@stylist/StylistController'
import { AuthorizationError, NotFoundError } from '@errors/ServiceErrors'
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
      throw new AuthorizationError('Shop is not owned by user')
    }

    const shopName = await ShopRepository.fetchShopName(shopId)
    if (!shopName) {
      throw new NotFoundError('Shop does not exist')
    }
    return shopName
  },
}

export default ShopService
