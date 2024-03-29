import { OrderBy as EntityOrderBy } from '@entities/Common'
import { UserForAuth } from '@entities/User'
import { Menu } from '@entities/Menu'
import MenuService from '@menu/services/MenuService'
import { MenuControllerInterface } from '@controller-adapter/Shop'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { convertOrderByToEntity } from '@dtoConverters/Common'
import { menuUpsertSchema, indexSchema } from './schemas'

export type MenuServiceInterface = {
  fetchShopMenusWithTotalCount(user: UserForAuth, shopId: number, page?: number, order?: EntityOrderBy, take?: number)
    : Promise<{ menus: Menu[], totalCount: number}>
  fetchShopMenu(user: UserForAuth, shopId: number, menuId: number): Promise<Menu>
  insertMenu(user: UserForAuth, shopId: number, name: string, description: string, price: number
    , duration: number)
    : Promise<Menu>
  updateMenu(user: UserForAuth, shopId: number, menuId: number, name: string,
    description: string, price: number, duration: number): Promise<Menu>
  deleteMenu(user: UserForAuth, shopId: number, menuId: number): Promise<Menu>
}

const MenuController: MenuControllerInterface = {
  async index(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { page, order, take } = await indexSchema.parseAsync(query)
    const { shopId } = query
    const { menus, totalCount } = await MenuService.fetchShopMenusWithTotalCount(
      user,
      shopId,
      page,
      order ? convertOrderByToEntity(order) : order,
      take,
    )
    return {
      values: menus.map(m => ({
        id: m.id,
        name: m.name,
        shopId: m.shopId,
        price: m.price,
        duration: m.duration,
      })),
      totalCount,
    }
  },

  async show(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId, menuId } = query
    return MenuService.fetchShopMenu(user, shopId, menuId)
  },

  async insert(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const {
      name, description, price, duration,
    } = await menuUpsertSchema.parseAsync(query.params)
    const { shopId } = query
    return MenuService.insertMenu(user, shopId, name, description, price, duration)
  },

  async update(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const {
      name, description, price, duration,
    } = await menuUpsertSchema.parseAsync(query.params)
    const { shopId, menuId } = query
    return MenuService.updateMenu(user, shopId, menuId, name, description, price, duration)
  },

  async delete(user, query) {
    if (!user) {
      throw new UnauthorizedError('User not found in request')
    }
    const { shopId, menuId } = query
    return MenuService.deleteMenu(user, shopId, menuId)
  },
}

export default MenuController
