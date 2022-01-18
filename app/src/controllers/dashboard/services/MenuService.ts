import { Menu } from '@entities/Menu'
import { MenuServiceInterface } from '@dashboard/DashboardController'
import MenuRepository from '@dashboard/repositories/MenuRepository'
import today from '@lib/Today'

export type MenuRepositoryInterface = {
  fetchPopularMenusByStaffIdAndDate(userId: number, year: number, month: number): Promise<Menu[]>
}

const MenuService: MenuServiceInterface = {
  async fetchPopularMenus(user) {
    const year = today.getFullYear()
    const month = today.getMonth()
    return MenuRepository.fetchPopularMenusByStaffIdAndDate(user.id, year, month)
  },
}

export default MenuService
