import prisma from '@lib/prisma'
import { ShopRepositoryInterface } from '@review/services/ReviewService'

const ShopRepository: ShopRepositoryInterface = {
  async fetchShopName(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, shopDetail: { select: { name: true } } },
    })
    return shop ? shop.shopDetail.name : null
  },

  async fetchUserShopIds(userId) {
    return (await prisma.shop.findMany({
      where: { shopUser: { userId } },
      select: { id: true },
    })).map(s => s.id)
  },

}

export default ShopRepository
