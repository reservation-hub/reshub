import { Menu } from '@entities/Menu'
import { MenuServiceInterface } from '@client/menu/MenuController'
import MenuRepository from '@client/menu/repositories/MenuRepository'

export type MenuRepositoryInterface = {
  fetchPopularMenus(year: number, month: number): Promise<Menu[]>
}

const MenuService: MenuServiceInterface = {
  async popularMenus(user) {
    console.log('user', user) // eslint-disable-line
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    return MenuRepository.fetchPopularMenus(year, month)
  },
}

export default MenuService
