import { Prisma } from '@prisma/client'
import { OrderBy } from '@entities/Common'
import { MenuRepositoryInterface } from '@client/menu/services/MenuService'
import { Menu } from '@entities/Menu'
import prisma from '@lib/prisma'
import redis from '@lib/redis'
import setPopularMenus from '@lib/PopularMenuSetter'

const convertEntityOrderToRepositoryOrder = (order: OrderBy): Prisma.SortOrder => {
  switch (order) {
    case OrderBy.ASC:
      return Prisma.SortOrder.asc
    default:
      return Prisma.SortOrder.desc
  }
}

const MenuRepository: MenuRepositoryInterface = {
  async fetchPopularMenus() {
    const cachedMenus = await redis.get('popularMenus')
    let menus: Menu[] = []
    if (cachedMenus) {
      menus = JSON.parse(cachedMenus as string)
    }
    return menus
  },

  setPopularMenus,

  async fetchMenus(shopId, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const menus = await prisma.menu.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: convertEntityOrderToRepositoryOrder(order) },
      take,
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
