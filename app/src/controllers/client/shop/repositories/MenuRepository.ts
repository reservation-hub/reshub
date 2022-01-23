import prisma from '@lib/prisma'
import { MenuRepositoryInterface } from '@client/shop/services/MenuService'

const MenuRepository: MenuRepositoryInterface = {
  async fetchShopMenus(shopId, limit) {
    return prisma.menu.findMany({
      where: { shopId },
      take: limit,
    })
  },
}

export default MenuRepository
