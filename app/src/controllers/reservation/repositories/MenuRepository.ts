import { MenuRepositoryInterface } from '@reservation/services/ReservationService'
import prisma from '@lib/prisma'

const MenuRepository: MenuRepositoryInterface = {
  async fetchMenusByIds(menuIds) {
    return prisma.menu.findMany({
      where: { id: { in: menuIds } },
    })
  },
  async fetchShopMenu(shopId, menuId) {
    return prisma.menu.findFirst({
      where: { id: menuId, AND: { shopId } },
    })
  },
  async fetchMenuIdsByShopId(shopId) {
    return (await prisma.menu.findMany({
      where: { shopId },
    })).map(m => m.id)
  },

  async fetchMenuDuration(menuId, shopId) {
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, AND: { shopId } },
    })
    return menu?.duration || null
  },

}

export default MenuRepository
