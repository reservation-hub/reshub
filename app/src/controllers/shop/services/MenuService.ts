import { MenuServiceInterface } from '@shop/ShopController'
import ShopRepository from '@shop/repositories/ShopRepository'
import { Menu } from '@entities/Menu'
import { RoleSlug } from '@entities/Role'
import MenuRepository from '@shop/repositories/MenuRepository'
import { AuthorizationError } from '@shop/services/ServiceError'
import Logger from '@lib/Logger'

export type ShopRepositoryInterface = {
  fetchUserShopIds(userId: number): Promise<number[]>
}

export type MenuRepositoryInterface = {
  fetchShopMenus(shopId: number, limit: number): Promise<Menu[]>
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  return userShopIds.some(id => id === shopId)
}

const MenuService: MenuServiceInterface = {
  async fetchShopMenus(user, shopId, limit = 10) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      Logger.debug('Shop is not owned by user')
      throw new AuthorizationError()
    }
    return MenuRepository.fetchShopMenus(shopId, limit)
  },
}

export default MenuService
