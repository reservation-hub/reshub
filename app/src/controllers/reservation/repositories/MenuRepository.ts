import { MenuRepositoryInterface } from '@reservation/services/ReservationService'
import prisma from '@/prisma'

const MenuRepository: MenuRepositoryInterface = {
  async fetchMenusByIds(menuIds) {
    return prisma.menu.findMany({
      where: { id: { in: menuIds } },
    })
  },

  async fetchMenuIdsByShopId(shopId) {
    return (await prisma.menu.findMany({
      where: { shopId },
    })).map(m => m.id)
  },
}

export default MenuRepository
