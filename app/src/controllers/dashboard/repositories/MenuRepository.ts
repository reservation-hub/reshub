import { MenuRepositoryInterface } from '@dashboard/services/ReservationService'
import prisma from '@/prisma'

const MenuRepository: MenuRepositoryInterface = {
  async fetchMenusByIds(menuIds) {
    return prisma.menu.findMany({
      where: { id: { in: menuIds } },
    })
  },
}

export default MenuRepository
