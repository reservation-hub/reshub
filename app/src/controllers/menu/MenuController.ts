import { UserForAuth } from '@entities/User'
import { Menu } from '@entities/Menu'
import { OrderBy } from '@request-response-types/Common'
import MenuService from '@menu/services/MenuService'
import { MenuControllerInterface } from '@controller-adapter/Shop'
import Logger from '@lib/Logger'
import { UnauthorizedError } from '@errors/ControllerErrors'
import { menuUpsertSchema, indexSchema } from './schemas'

export type MenuServiceInterface = {
  fetchShopMenusWithTotalCount(user: UserForAuth, shopId: number, page?: number, order?: OrderBy)
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
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }
    const { page, order } = await indexSchema.parseAsync(query)
    const { shopId } = query
    const { menus, totalCount } = await MenuService.fetchShopMenusWithTotalCount(user, shopId, page, order)
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
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }
    const { shopId, menuId } = query
    return MenuService.fetchShopMenu(user, shopId, menuId)
  },

  async insert(user, query) {
    if (!user) {
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }
    const {
      name, description, price, duration,
    } = await menuUpsertSchema.parseAsync(query.params)
    const { shopId } = query
    await MenuService.insertMenu(user, shopId, name, description, price, duration)
    return 'Menu created'
  },

  async update(user, query) {
    if (!user) {
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }
    const {
      name, description, price, duration,
    } = await menuUpsertSchema.parseAsync(query.params)
    const { shopId, menuId } = query
    await MenuService.updateMenu(user, shopId, menuId, name, description, price, duration)
    return 'Menu updated'
  },

  async delete(user, query) {
    if (!user) {
      Logger.debug('User not found in request')
      throw new UnauthorizedError()
    }
    const { shopId, menuId } = query
    await MenuService.deleteMenu(user, shopId, menuId)
    return 'Menu deleted'
  },
}

export default MenuController
