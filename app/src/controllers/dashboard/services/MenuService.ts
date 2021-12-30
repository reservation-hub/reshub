import { Menu } from '@entities/Menu'
import { MenuServiceInterface } from '@dashboard/DashboardController'
import MenuRepository from '@dashboard/repositories/MenuRepository'
import Logger from '@lib/Logger'

export type MenuRepositoryInterface = {
  fetchPopularMenusByStaffIdAndDate(userId: number, year: number, month: number): Promise<Menu[]>
}

const MenuService: MenuServiceInterface = {
  async fetchPopularMenus(user) {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    Logger.info(`${today}, ${year}, ${month}`)
    return MenuRepository.fetchPopularMenusByStaffIdAndDate(user.id, year, month)
  },
}

export default MenuService
