import { MenuRepositoryInterface } from '@cron/services/MenuService'
import setPopularMenus from '@lib/PopularMenuSetter'

const MenuRepository: MenuRepositoryInterface = {
  setPopularMenus,
}

export default MenuRepository
