import { UserForAuth } from '@entities/User'
import { Menu } from '@entities/Menu'
import { OrderBy } from '@request-response-types/Common'
import MenuService from '@menu/services/MenuService'
import { menuUpsertSchema, indexSchema } from './schemas'
import { MenuControllerInterface } from '@/controller-adapter/Shop'

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

const joiOptions = { abortEarly: false, stripUnknown: true }

const MenuController: MenuControllerInterface = {
  async index(user, query) {
    const { page, order } = await indexSchema.validateAsync(query, joiOptions)
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
    const { shopId, menuId } = query
    return MenuService.fetchShopMenu(user, shopId, menuId)
  },

  async insert(user, query) {
    const {
      name, description, price, duration,
    } = await menuUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId } = query
    await MenuService.insertMenu(user, shopId, name, description, price, duration)
    return 'Menu created'
  },

  async update(user, query) {
    const {
      name, description, price, duration,
    } = await menuUpsertSchema.validateAsync(query.params, joiOptions)
    const { shopId, menuId } = query
    await MenuService.updateMenu(user, shopId, menuId, name, description, price, duration)
    return 'Menu updated'
  },

  async delete(user, query) {
    const { shopId, menuId } = query
    await MenuService.deleteMenu(user, shopId, menuId)
    return 'Menu deleted'
  },
}

export default MenuController
