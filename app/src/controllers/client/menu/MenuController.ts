import { Menu } from '@entities/Menu'
import { UserForAuth } from '@entities/User'
import { MenuControllerInterface } from '@controller-adapter/client/Menu'
import MenuService from '@client/menu/services/MenuService'

export type MenuServiceInterface = {
  popularMenus(user: UserForAuth): Promise<Menu[]>
}

const MenuController: MenuControllerInterface = {
  async popularMenus(user) {
    return MenuService.popularMenus(user)
  },
}

export default MenuController
