import { OrderBy as EntityOrderBy } from '@entities/Common'
import { Menu } from '@entities/Menu'
import { UserForAuth } from '@entities/User'
import MenuService from '@client/menu/services/MenuService'
import { MenuControllerInterface as MenuSocket } from '@controller-adapter/client/Menu'
import { MenuControllerInterface as ShopSocket } from '@controller-adapter/client/Shop'
import { convertOrderByToEntity } from '@dtoConverters/Common'
import { indexSchema } from './schemas'

export type MenuServiceInterface = {
  popularMenus(user: UserForAuth | undefined): Promise<Menu[]>
  fetchShopMenusWithTotalCount(user: UserForAuth | undefined, shopId: number, page?: number,
    order?: EntityOrderBy, take?: number)
    :Promise<{ menus: Menu[], totalCount: number}>
}

const MenuController: MenuSocket & ShopSocket = {
  async popularMenus(user) {
    return MenuService.popularMenus(user)
  },

  async list(user, query) {
    const { shopId } = query
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { menus, totalCount } = await MenuService.fetchShopMenusWithTotalCount(
      user,
      shopId,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
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
