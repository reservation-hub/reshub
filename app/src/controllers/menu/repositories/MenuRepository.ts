import { MenuRepositoryInterface } from '@menu/services/MenuService'
import prisma from '@lib/prisma'

const MenuRepository: MenuRepositoryInterface = {
  async fetchAllShopMenus(shopId, page, order, take) {
    const skipIndex = page > 1 ? (page - 1) * take : 0
    const menus = await prisma.menu.findMany({
      where: { shopId },
      skip: skipIndex,
      orderBy: { id: order },
      take,
    })
    return menus
  },

  async totalShopMenuCount(shopId) {
    return prisma.menu.count({
      where: { shopId },
    })
  },

  async fetchMenu(shopId, menuId) {
    return prisma.menu.findFirst({
      where: { id: menuId, AND: { shopId } },
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
