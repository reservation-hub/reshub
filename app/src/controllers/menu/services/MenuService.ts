import { NotFoundError, AuthorizationError } from '@errors/ServiceErrors'
import { MenuServiceInterface } from '@menu/MenuController'
import ShopRepository from '@menu/repositories/ShopRepository'
import MenuRepository from '@menu/repositories/MenuRepository'
import { RoleSlug } from '@entities/Role'
import { Menu } from '@entities/Menu'
import { OrderBy } from '@entities/Common'

export type ShopRepositoryInterface = {
  shopExists(shopId: number): Promise<boolean>
  fetchUserShopIds(userId: number): Promise<number[]>
}

export type MenuRepositoryInterface = {
  fetchAllShopMenus(shopId: number, page: number, order: OrderBy, take: number): Promise<Menu[]>
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
  return userShopIds.some(id => id === shopId)
}

const MenuService: MenuServiceInterface = {
  async fetchShopMenusWithTotalCount(user, shopId, page = 1, order = OrderBy.DESC, take = 10) {
    if (!await ShopRepository.shopExists(shopId)) {
      throw new NotFoundError('Shop does not exist')
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const menus = await MenuRepository.fetchAllShopMenus(shopId, page, order, take)
    const totalCount = await MenuRepository.totalShopMenuCount(shopId)
    return { menus, totalCount }
  },

  async fetchShopMenu(user, shopId, menuId) {
    if (!await ShopRepository.shopExists(shopId)) {
      throw new NotFoundError('Shop does not exist')
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const menu = await MenuRepository.fetchMenu(shopId, menuId)
    if (!menu) {
      throw new NotFoundError('Menu does not exist')
    }

    return menu
  },

  async insertMenu(user, shopId, name, description, price, duration) {
    if (!await ShopRepository.shopExists(shopId)) {
      throw new NotFoundError('Shop does not exist')
    }

    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    const menu = await MenuRepository.insertShopMenu(shopId, name,
      description, price, duration)
    return menu
  },

  async updateMenu(user, shopId, menuId, name, description, price, duration) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    if (!await ShopRepository.shopExists(shopId)) {
      throw new NotFoundError('Shop does not exist')
    }
    if (!await isValidMenuId(shopId, menuId)) {
      throw new NotFoundError('Menu is not of the shop')
    }

    return MenuRepository.updateShopMenu(menuId, name,
      description, price, duration)
  },

  async deleteMenu(user, shopId, menuId) {
    if (user.role.slug === RoleSlug.SHOP_STAFF && !await isUserOwnedShop(user.id, shopId)) {
      throw new AuthorizationError('Shop is not owned by user')
    }

    if (!await ShopRepository.shopExists(shopId)) {
      throw new NotFoundError('shop not found')
    }
    if (!await isValidMenuId(shopId, menuId)) {
      throw new NotFoundError('Menu not found')
    }

    return MenuRepository.deleteShopMenu(menuId)
  },
}

export default MenuService
