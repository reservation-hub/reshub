import { MenuRepositoryInterface } from '@client/user/services/UserService'
import prisma from '@lib/prisma'

const ReviewRepository: MenuRepositoryInterface = {
  async fetchMenuNamesByIds(menuId) {
    const menu = await prisma.menu.findMany({
      where: { id: { in: menuId } },
    })
    return menu.map(m => ({
      menuId: m.id,
      menuName: m.name,
    }))
  },
}

export default ReviewRepository
