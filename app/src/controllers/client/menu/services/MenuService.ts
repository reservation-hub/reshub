import { OrderBy } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { MenuServiceInterface } from '@client/menu/MenuController'
import MenuRepository from '@client/menu/repositories/MenuRepository'

export type MenuRepositoryInterface = {
  fetchPopularMenus(): Promise<Menu[]>
  setPopularMenus(year: number, month: number): Promise<void>
  fetchMenus(shopId: number, page: number, order: OrderBy): Promise<Menu[]>
  fetchMenuTotalCount(shopId: number): Promise<number>
}

const MenuService: MenuServiceInterface = {
  async popularMenus(user) {
    let popularMenus:Menu[]
    popularMenus = await MenuRepository.fetchPopularMenus()
    if (popularMenus.length === 0) {
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth()
      await MenuRepository.setPopularMenus(year, month)
      popularMenus = await MenuRepository.fetchPopularMenus()
    }
    return popularMenus
  },

  async fetchShopMenusWithTotalCount(user, shopId, page = 1, order = OrderBy.DESC) {
    const menus = await MenuRepository.fetchMenus(shopId, page, order)
    const totalCount = await MenuRepository.fetchMenuTotalCount(shopId)
    return { menus, totalCount }
  },
}

export default MenuService
