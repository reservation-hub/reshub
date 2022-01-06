import { MenuRepositoryInterface } from '@client/reservation/services/ReservationService'
import prisma from '@/prisma'

const MenuRepository: MenuRepositoryInterface = {
  async fetchShopMenuIds(shopId) {
    return (await prisma.menu.findMany({
      where: { shopId },
    })).map(m => m.id)
  },

  async fetchMenu(menuId) {
    return prisma.menu.findUnique({
      where: { id: menuId },
    })
  },
}

export default MenuRepository
