import { OrderBy } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { MenuServiceInterface } from '@client/menu/MenuController'
import MenuRepository from '@client/menu/repositories/MenuRepository'

export type MenuRepositoryInterface = {
  fetchPopularMenus(year: number, month: number): Promise<Menu[]>
  fetchMenus(shopId: number, page: number, order: OrderBy): Promise<Menu[]>
  fetchMenuTotalCount(shopId: number): Promise<number>
}

const MenuService: MenuServiceInterface = {
  async popularMenus(user) {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    return MenuRepository.fetchPopularMenus(year, month)
  },

  async fetchShopMenusWithTotalCount(user, shopId, page = 1, order = OrderBy.DESC) {
    const menus = await MenuRepository.fetchMenus(shopId, page, order)
    const totalCount = await MenuRepository.fetchMenuTotalCount(shopId)
    return { menus, totalCount }
  },
}

export default MenuService
