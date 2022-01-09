import { MenuRepositoryInterface } from '@client/reservation/services/ReservationService'
import prisma from '@lib/prisma'

const MenuRepository: MenuRepositoryInterface = {
  async fetchShopMenu(shopId, menuId) {
    return prisma.menu.findFirst({
      where: { id: menuId, AND: { shopId } },
    })
  },
}

export default MenuRepository
