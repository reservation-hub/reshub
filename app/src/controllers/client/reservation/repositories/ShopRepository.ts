import { ShopRepositoryInterface } from '@client/reservation/services/ShopService'
import prisma from '@/prisma'

const ShopRepository: ShopRepositoryInterface = {
  async fetchUserShopIds(userId) {
    return (await prisma.shop.findMany({
      where: { shopUser: { userId } },
      select: { id: true },
    })).map(s => s.id)
  },

  async fetchShopSeatCount(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { shopDetail: true },
    })

    return shop ? shop.shopDetail.seats : null
  },
}

export default ShopRepository
