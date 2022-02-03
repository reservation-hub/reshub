import prisma from '@lib/prisma'
import { ShopRepositoryInterface } from '@tag/services/TagService'

const ShopRepository: ShopRepositoryInterface = {
  async fetchUserShopIds(userId) {
    return (await prisma.shop.findMany({
      where: { shopUser: { userId } },
      select: { id: true },
    })).map(s => s.id)
  },

}

export default ShopRepository
