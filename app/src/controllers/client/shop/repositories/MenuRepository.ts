import { MenuRepositoryInterface } from '../services/MenuService'
import prisma from '@/prisma'

const MenuRepository: MenuRepositoryInterface = {
  async fetchShopMenus(shopId, limit) {
    return prisma.menu.findMany({
      where: { shopId },
      take: limit,
    })
  },
}

export default MenuRepository
