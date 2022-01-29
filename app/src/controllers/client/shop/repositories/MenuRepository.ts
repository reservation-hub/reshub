import prisma from '@lib/prisma'
import { MenuRepositoryInterface } from '@client/shop/services/MenuService'
import { Menu } from '@entities/Menu'

const MenuRepository: MenuRepositoryInterface = {
  async fetchShopMenus(shopId, limit) {
    return prisma.menu.findMany({
      where: { shopId },
      take: limit,
    })
  },

  async fetchShopsMenus(shopIds) {
    const menus = await prisma.menu.findMany({
      where: { shopId: { in: shopIds } },
    })
    const menusGroupedByShopId = shopIds.map(shopId => ({
      shopId,
      menus: [] as Menu[],
    }))
    menus.forEach(m => menusGroupedByShopId.find(mgbsi => mgbsi.shopId === m.shopId)?.menus.push(m))
    return menusGroupedByShopId
  },
}

export default MenuRepository
