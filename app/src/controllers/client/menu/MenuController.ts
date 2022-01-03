import { OrderBy } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { UserForAuth } from '@entities/User'
import MenuService from '@client/menu/services/MenuService'
import { MenuControllerInterface as MenuSocket } from '@controller-adapter/client/Menu'
import { MenuControllerInterface as ShopSocket } from '@controller-adapter/client/Shop'
import { indexSchema } from './schemas'

export type MenuServiceInterface = {
  popularMenus(user: UserForAuth): Promise<Menu[]>
  fetchShopMenusWithTotalCount(user: UserForAuth, shopId: number, page: number, order: OrderBy)
    :Promise<{ menus: Menu[], totalCount: number}>
}
const joiOptions = { abortEarly: false, stripUnknown: true }
const MenuController: MenuSocket & ShopSocket = {
  async popularMenus(user) {
    return MenuService.popularMenus(user)
  },

  async list(user, query) {
    const { shopId } = query
    const { page, order } = await indexSchema.validateAsync(query, joiOptions)
    const { menus, totalCount } = await MenuService.fetchShopMenusWithTotalCount(user, shopId, page, order)
    const values = menus.map(m => ({
      id: m.id,
      shopId: m.shopId,
      name: m.name,
      price: m.price,
      duration: m.duration,
      description: m.description,
    }))
    return { values, totalCount }
  },
}

export default MenuController
