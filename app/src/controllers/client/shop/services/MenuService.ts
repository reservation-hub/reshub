import { Menu } from '@entities/Menu'
import MenuRepository from '@client/shop/repositories/MenuRepository'
import ShopRepository from '@client/shop/repositories/ShopRepository'
import Logger from '@lib/Logger'
import { NotFoundError } from '@errors/ServiceErrors'
import { MenuServiceInterface } from '@client/shop/ShopController'

export type ShopRepositoryInterface = {
  shopExists(shopId: number): Promise<boolean>
}

export type MenuRepositoryInterface = {
  fetchShopMenus(shopId: number, limit: number): Promise<Menu[]>
  fetchShopsMenus(shopIds: number[]): Promise<{ shopId: number, menus: Menu[] }[]>
}

const MenuService: MenuServiceInterface = {
  async fetchShopMenus(shopId) {
    const limit = 5
    const shopExists = await ShopRepository.shopExists(shopId)
    if (!shopExists) {
      Logger.debug('Shop does not exist')
      throw new NotFoundError()
    }
    return MenuRepository.fetchShopMenus(shopId, limit)
  },

  async fetchShopAverageMenuPriceByShopIds(shopIds) {
    const shopMenus = await MenuRepository.fetchShopsMenus(shopIds)
    return shopIds.map(shopId => {
      const shopMenu = shopMenus.find(sm => sm.shopId === shopId)
      let average: number
      if (!shopMenu) {
        average = 0
      } else {
        const total = shopMenu.menus.reduce((sum, m) => sum + m.price, 0)
        average = Math.floor(total / shopMenu.menus.length)
      }
      return {
        shopId,
        price: average,
      }
    })
  },
}

export default MenuService
