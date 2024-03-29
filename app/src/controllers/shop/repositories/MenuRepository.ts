import { MenuRepositoryInterface } from '@shop/services/MenuService'
import prisma from '@lib/prisma'

const MenuRepository: MenuRepositoryInterface = {
  async fetchShopMenus(shopId, limit) {
    return prisma.menu.findMany({
      where: { shopId },
      take: limit,
    })
  },
}

export default MenuRepository
