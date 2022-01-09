import { MenuRepositoryInterface } from '@client/menu/services/MenuService'
import { Menu } from '@entities/Menu'
import prisma from '@lib/prisma'
import redis from '@lib/redis'

const MenuRepository: MenuRepositoryInterface = {
  async fetchPopularMenus() {
    const cachedMenus = await redis.get('popularMenus')
    let menus: Menu[] = []
    if (cachedMenus) {
      menus = JSON.parse(cachedMenus as string)
    }
    return menus
  },

  async fetchMenus(shopId, page, order) {
    const limit = 10
    const skipIndex = page > 1 ? (page - 1) * 10 : 0
    const menus = await prisma.menu.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: order },
      take: limit,
    })
    return menus
  },

  async fetchMenuTotalCount(shopId) {
    return prisma.menu.count({
      where: { shopId },
    })
  },
}

export default MenuRepository
