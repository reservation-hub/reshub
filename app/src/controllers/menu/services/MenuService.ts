import { NotFoundError, AuthorizationError } from '@menu/services/ServiceError'
import ShopRepository from '@menu/repositories/ShopRepository'
import MenuRepository from '@menu/repositories/MenuRepository'
import { RoleSlug } from '@entities/Role'
import { Menu } from '@entities/Menu'
import { OrderBy } from '@entities/Common'
import { MenuServiceInterface } from '../MenuController'

export type ShopRepositoryInterface = {
  shopExists(shopId: number): Promise<boolean>
  fetchUserShopIds(userId: number): Promise<number[]>
}

export type MenuRepositoryInterface = {
  fetchAllShopMenus(shopId: number, page: number, order: OrderBy): Promise<Menu[]>
  totalShopMenuCount(shopId: number): Promise<number>
  fetchMenu(shopId: number, menuId: number): Promise<Menu | null>
  insertShopMenu(shopId: number, name: string, description: string, price: number, duration: number): Promise<Menu>
  updateShopMenu(menuId: number, name: string, description: string, price: number,
    duration: number): Promise<Menu>
  deleteShopMenu(menuId: number): Promise<Menu>
  fetchShopMenuIds(shopId: number): Promise<number[]>
}

const isValidMenuId = async (shopId: number, menuId: number): Promise<boolean> => {
  const menuIds = await MenuRepository.fetchShopMenuIds(shopId)
  return menuIds.some(m => m === menuId)
}

const isUserOwnedShop = async (userId: number, shopId: number): Promise<boolean> => {
  const userShopIds = await ShopRepository.fetchUserShopIds(userId)
  const result = userShopIds.some(id => id === shopId)
  return result
}

const MenuService: MenuServiceInterface = {
  async fetchShopMenusWithTotalCount(user, shopId, page = 1, order = OrderBy.DESC) {
    if (!await ShopRepository.shopExists(shopId)) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const menus = await MenuRepository.fetchAllShopMenus(shopId, page, order)
    const totalCount = await MenuRepository.totalShopMenuCount(shopId)
    return { menus, totalCount }
  },

  async fetchShopMenu(user, shopId, menuId) {
    if (!await ShopRepository.shopExists(shopId)) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const menu = await MenuRepository.fetchMenu(shopId, menuId)
    if (!menu) {
      console.error('Menu does not exist')
      throw new NotFoundError()
    }

    return menu
  },

  async insertMenu(user, shopId, name, description, price, duration) {
    if (!await ShopRepository.shopExists(shopId)) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    const menu = await MenuRepository.insertShopMenu(shopId, name,
      description, price, duration)
    return menu
  },

  async updateMenu(user, shopId, menuId, name, description, price, duration) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    if (!await ShopRepository.shopExists(shopId)) {
      console.error('Shop does not exist')
      throw new NotFoundError()
    }
    if (!await isValidMenuId(shopId, menuId)) {
      console.error('Menu is not of the shop')
      throw new NotFoundError()
    }

    return MenuRepository.updateShopMenu(menuId, name,
      description, price, duration)
  },

  async deleteMenu(user, shopId, menuId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      console.error('Shop is not owned by user')
      throw new AuthorizationError()
    }

    if (!await ShopRepository.shopExists(shopId)) {
      console.error('shop not found')
      throw new NotFoundError()
    }
    if (!await isValidMenuId(shopId, menuId)) {
      console.error('Menu not found')
      throw new NotFoundError()
    }

    return MenuRepository.deleteShopMenu(menuId)
  },
}

export default MenuService
