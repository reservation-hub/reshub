import { MenuRepositoryInterface } from '@menu/services/MenuService'
import prisma from '@/prisma'

const MenuRepository: MenuRepositoryInterface = {
  async fetchAllShopMenus(shopId, page, order) {
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

  async totalShopMenuCount(shopId) {
    return prisma.menu.count({
      where: { shopId },
    })
  },

  async fetchMenu(menuId) {
    return prisma.menu.findUnique({
      where: { id: menuId },
    })
  },

  async insertShopMenu(shopId, name, description, price, duration) {
    return prisma.menu.create({
      data: {
        name,
        description,
        price,
        duration,
        shop: {
          connect: { id: shopId },
        },
      },
    })
  },

  async updateShopMenu(menuId, name, description, price, duration) {
    return prisma.menu.update({
      where: { id: menuId },
      data: {
        name, description, price, duration,
      },
    })
  },

  async deleteShopMenu(menuId) {
    return prisma.menu.delete({ where: { id: menuId } })
  },

  async fetchShopMenuIds(shopId) {
    return (await prisma.shop.findUnique({
      where: { id: shopId },
      select: { menu: true },
    }))!.menu.map(m => m.id)
  },
}

export default MenuRepository