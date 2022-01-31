import { MenuRepositoryInterface } from '@client/reservation/services/ReservationService'
import prisma from '@lib/prisma'

const MenuRepository: MenuRepositoryInterface = {
  async fetchShopMenu(shopId, menuId) {
    return prisma.menu.findFirst({
      where: { id: menuId, AND: { shopId } },
    })
  },

  async fetchMenusByIds(ids) {
    return prisma.menu.findMany({
      where: { id: { in: ids } },
    })
  },
}

export default MenuRepository
