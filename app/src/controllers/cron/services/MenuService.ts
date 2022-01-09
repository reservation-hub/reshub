import { MenuServiceInterface } from '@cron/CronController'
import MenuRepository from '@cron/repositories/MenuRepository'

export type MenuRepositoryInterface = {
  setPopularMenus(year: number, month: number): Promise<void>
}

const MenuService: MenuServiceInterface = {
  async setPopularMenus() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    await MenuRepository.setPopularMenus(year, month)
  },
}

export default MenuService
